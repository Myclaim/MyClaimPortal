import sys

with open('backend/models/client/Client.js', 'r') as f:
    content = f.read()

hook = """
// Auto-generate referral code on creation
clientSchema.pre('save', async function (next) {
  if (this.isNew && !this.referralCode) {
    let unique = false;
    while (!unique) {
      const code = 'MC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await mongoose.models.Client.findOne({ referralCode: code });
      if (!existing) {
        this.referralCode = code;
        unique = true;
      }
    }
  }
  next();
});

module.exports = mongoose.model('Client', clientSchema);
"""

content = content.replace("module.exports = mongoose.model('Client', clientSchema);", hook)

with open('backend/models/client/Client.js', 'w') as f:
    f.write(content)
