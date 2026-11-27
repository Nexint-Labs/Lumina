const { log } = require("./log.mjs");

const { frameName, frameVer, frameID, updateSource, updateURL } = require('#config/core/framework');
const { accent, lumeAccent } = require("./gradient");

/**
 * Gets the latest version of this Lumina!
 * @returns 
 */
const getUpdateVersion = async function () {
    try {
        // Update Versions
        const update = await fetch(updateSource + "/ver.txt", {
            signal: AbortSignal.timeout(5000)
        });
        if (!update.ok) {
            throw new Error(`HTTP ${update.status}: ${update.statusText}`);
        }

        // Update Version
        const updateName = await fetch(updateSource + "/verName.txt", {
            signal: AbortSignal.timeout(5000)
        });
        if (!updateName.ok) {
            throw new Error(`HTTP ${updateName.status}: ${updateName.statusText}`);
        }

        // Get the actual versions lol
        const tmp = await update.text();
        const version = Number(tmp)
        const result = await updateName.text();
        const versionName = result

        // isNan?
        if (Number.isSafeInteger(version) && version > 0) {
            return [versionName, version]
        } else {
            throw new Error("Not a (valid) number.")
        }
    } catch (error) {
        log.error("An error happened while trying to check for updates!")
        log.error(`Likely caused by ${lumeAccent(frameName)} being unable to access Github. Full stack trace:`, error)
        return 0;
    }
};


/**
 * Update Checker
 * If it's the initial check, it notifies even if it's the latest version.
 * If not, it does not notify.
 * @param {Boolean} initial 
 */
const updateCheck = async function (initial) {
    const check = await getUpdateVersion();
    if (!check) {
        log.error(`Something went wrong updating ${lumeAccent(frameName)}!`)
        return;
    }
    const [versionName, latestVersion] = check

    if (frameID < latestVersion) {
        log.warn(`You're running an outdated version of ${lumeAccent(frameName)}! (You are ${latestVersion - frameID} revisions behind)`)
        log.warn(`Update now at ${updateURL} to make sure that ${lumeAccent(frameName)} has the latest security fixes!`)
        if ((latestVersion - frameID) >= 5) {
            log.warn(`You are 5 or more revisions behind. Update to the latest version as soon as possible.`)
        }
        log.warn(`Current version: v${frameVer} / Latest Version: ${versionName}`)
    } else if (frameID > latestVersion) {
        log.warn(`You're running an experimental version of ${lumeAccent(frameName)}! (You are ${frameID - latestVersion} revisions ahead)`)
        log.warn(`Here be dragons!~`)
        if ((frameID - latestVersion) >= 5) {
            log.warn(`You are 5 or more revisions ahead. This version is in active development.`)
        }
        log.warn(`Current version: v${frameVer} / Latest Version: ${versionName}`)
    } else if (initial) {
        log.info(`You're running the latest version of ${lumeAccent(frameName)}!`)
    }
}

module.exports = {
    getUpdateVersion,
    updateCheck
}