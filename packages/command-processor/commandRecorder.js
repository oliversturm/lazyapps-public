import { createWriteStream, fsyncSync } from 'fs';
import { getLogger } from '@lazyapps/logger';

const initLog = getLogger('CP/CmdRec', 'INIT');

export const createCommandRecorder = (filePath) => {
  initLog.info(`Setting up command recording to ${filePath}`);

  const writeStream = createWriteStream(filePath, {
    flags: 'a',
    encoding: 'utf8',
    // Set to false to ensure we control when data is flushed
    autoClose: false,
  });

  // Handle stream errors
  writeStream.on('error', (error) => {
    initLog.error(`Error writing to command record file: ${error}`);
  });

  const recordCommand = (commandRecord) => {
    return new Promise((resolve, reject) => {
      const log = getLogger('CP/CmdRec', commandRecord.correlationId);
      writeStream.write(JSON.stringify(commandRecord) + '\n', (error) => {
        if (error) {
          log.error(
            `Failed to record command ${commandRecord.command}: ${error}`,
          );
          reject(error);
          return;
        }

        // Force flush to disk
        try {
          writeStream.fd && fsyncSync(writeStream.fd);
          log.debug(`Recorded command ${commandRecord.command}.`);
          resolve(commandRecord);
        } catch (error) {
          log.error(
            `Failed to flush command ${commandRecord.command}: ${error}`,
          );
          reject(error);
        }
      });
    });
  };

  // Add cleanup method
  const close = () => {
    return new Promise((resolve, reject) => {
      // Ensure final flush before closing
      try {
        writeStream.fd && fsyncSync(writeStream.fd);
      } catch (error) {
        initLog.error(`Error flushing final data: ${error}`);
      }

      writeStream.end((error) => {
        if (error) {
          initLog.error(`Error closing command record file: ${error}`);
          reject(error);
        } else {
          initLog.info('Command recorder closed');
          resolve();
        }
      });
    });
  };

  return { recordCommand, close };
};
