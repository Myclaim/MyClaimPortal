const axios = require('axios');
const { parse } = require('csv-parse/sync');
const Company = require('../models/Company');
const SyncLog = require('../models/SyncLog');

const NSE_CSV_URL = 'https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv';
const BSE_JSON_URL = 'https://api.bseindia.com/BseIndiaAPI/api/ListofScripData/w?Group=&Scripcode=&status=Active&Segment=Equity';

const normalizeName = (name) => {
  return name ? name.trim().replace(/\s+/g, ' ') : '';
};

// Global lock to prevent overlapping syncs
let isSyncRunning = false;

const syncNSECompanies = async (logId) => {
  console.log('NSE Sync Started');
  const syncLog = await SyncLog.findById(logId);
  let processed = 0;
  let inserted = 0;
  let updated = 0;
  
  try {
    const response = await axios.get(NSE_CSV_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.data || response.data.trim().length === 0) {
      throw new Error('Received empty data from NSE');
    }

    const records = parse(response.data, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    if (records.length === 0) {
      throw new Error('Parsed 0 records from NSE CSV');
    }

    // Process in chunks or construct bulk operations
    const bulkOps = [];
    const timestamp = new Date();

    for (const record of records) {
      const symbol = record['SYMBOL'];
      const name = normalizeName(record['NAME OF COMPANY']);
      let isin = record[' ISIN NUMBER'] || record['ISIN NUMBER'] || record['ISIN'];
      if(isin) isin = isin.trim();

      if (!symbol || !name) continue;
      processed++;

      const updateOp = {
        updateOne: {
          filter: {},
          update: {
            $set: {
              name,
              nseSymbol: symbol,
              status: 'ACTIVE',
              lastSyncedAt: timestamp
            },
            $addToSet: {
              exchanges: 'NSE'
            }
          },
          upsert: true
        }
      };

      // Match by ISIN if available, else fallback to NSE symbol
      if (isin) {
        updateOp.updateOne.filter = { isin };
        updateOp.updateOne.update.$set.isin = isin;
      } else {
        updateOp.updateOne.filter = { nseSymbol: symbol };
      }

      bulkOps.push(updateOp);
    }

    if (bulkOps.length > 0) {
      const result = await Company.bulkWrite(bulkOps, { ordered: false });
      inserted = result.upsertedCount || 0;
      updated = result.modifiedCount || 0;
    }

    console.log(`NSE Sync Completed: ${processed} processed, ${inserted} new, ${updated} updated.`);
    
    if (syncLog) {
      syncLog.recordsProcessed += processed;
      syncLog.recordsInserted += inserted;
      syncLog.recordsUpdated += updated;
      await syncLog.save();
    }
    
    return { success: true, processed, inserted, updated };
  } catch (error) {
    console.error('NSE Sync Failed:', error.message);
    if (syncLog) {
      syncLog.errorMessage = (syncLog.errorMessage ? syncLog.errorMessage + ' | ' : '') + `NSE Error: ${error.message}`;
      await syncLog.save();
    }
    return { success: false, error: error.message };
  }
};

const syncBSECompanies = async (logId) => {
  console.log('BSE Sync Started');
  const syncLog = await SyncLog.findById(logId);
  let processed = 0;
  let inserted = 0;
  let updated = 0;
  
  try {
    const response = await axios.get(BSE_JSON_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
        'Referer': 'https://www.bseindia.com/'
      }
    });

    const records = response.data;
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('Received invalid or empty data from BSE');
    }

    const bulkOps = [];
    const timestamp = new Date();

    for (const record of records) {
      const scripCode = record.SCRIP_CD;
      const scripId = record.scrip_id;
      const name = normalizeName(record.Scrip_Name);
      let isin = record.ISIN_NUMBER;
      if(isin) isin = isin.trim();

      if (!scripCode || !name) continue;
      processed++;

      const updateOp = {
        updateOne: {
          filter: {},
          update: {
            $set: {
              bseScripCode: scripCode,
              bseScripId: scripId,
              status: record.Status === 'Active' ? 'ACTIVE' : 'INACTIVE',
              lastSyncedAt: timestamp
            },
            $addToSet: {
              exchanges: 'BSE'
            }
          },
          upsert: true
        }
      };

      // Set name only if it's a new insert, otherwise keep existing name to avoid overwriting NSE name if present
      updateOp.updateOne.update.$setOnInsert = { name };

      // Match by ISIN if available, else fallback to BSE Scrip Code
      if (isin) {
        updateOp.updateOne.filter = { isin };
        updateOp.updateOne.update.$set.isin = isin;
      } else {
        updateOp.updateOne.filter = { bseScripCode: scripCode };
      }

      bulkOps.push(updateOp);
    }

    if (bulkOps.length > 0) {
      const result = await Company.bulkWrite(bulkOps, { ordered: false });
      inserted = result.upsertedCount || 0;
      updated = result.modifiedCount || 0;
    }

    console.log(`BSE Sync Completed: ${processed} processed, ${inserted} new, ${updated} updated.`);
    
    if (syncLog) {
      syncLog.recordsProcessed += processed;
      syncLog.recordsInserted += inserted;
      syncLog.recordsUpdated += updated;
      await syncLog.save();
    }
    
    return { success: true, processed, inserted, updated };
  } catch (error) {
    console.error('BSE Sync Failed:', error.message);
    if (syncLog) {
      syncLog.errorMessage = (syncLog.errorMessage ? syncLog.errorMessage + ' | ' : '') + `BSE Error: ${error.message}`;
      await syncLog.save();
    }
    return { success: false, error: error.message };
  }
};

const syncAllCompanies = async () => {
  if (isSyncRunning) {
    console.log('Sync is already running. Skipping this trigger.');
    return;
  }
  isSyncRunning = true;

  const syncLog = new SyncLog({
    exchange: 'ALL',
    status: 'STARTED'
  });
  await syncLog.save();

  try {
    const [nseResult, bseResult] = await Promise.all([
      syncNSECompanies(syncLog._id),
      syncBSECompanies(syncLog._id)
    ]);

    syncLog.completedAt = new Date();
    if (nseResult.success && bseResult.success) {
      syncLog.status = 'SUCCESS';
    } else if (nseResult.success || bseResult.success) {
      syncLog.status = 'PARTIAL';
    } else {
      syncLog.status = 'FAILED';
    }
    
    await syncLog.save();
    console.log(`Global Sync Finished. Status: ${syncLog.status}`);
  } catch (error) {
    console.error('Global Sync Error:', error);
    syncLog.status = 'FAILED';
    syncLog.completedAt = new Date();
    syncLog.errorMessage = error.message;
    await syncLog.save();
  } finally {
    isSyncRunning = false;
  }
};

module.exports = {
  syncNSECompanies,
  syncBSECompanies,
  syncAllCompanies
};
