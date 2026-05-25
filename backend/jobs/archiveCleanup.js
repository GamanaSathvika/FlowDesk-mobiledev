const { runArchiveCleanup } = require('../utils/archiveRetention');

const DAY_MS = 24 * 60 * 60 * 1000;

function startArchiveCleanupJob() {
  const run = async () => {
    try {
      const removed = await runArchiveCleanup();
      if (removed > 0) {
        console.log(`🧹 Archive cleanup: removed ${removed} expired task(s)`);
      }
    } catch (err) {
      console.error('Archive cleanup error:', err);
    }
  };

  run();
  setInterval(run, DAY_MS);
}

module.exports = { startArchiveCleanupJob };
