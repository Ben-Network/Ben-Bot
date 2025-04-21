let skipValidation = false;

function markCacheAsUpdated() {
    skipValidation = true;
    console.info('[INFO] Cache marked as updated. Validation will be skipped temporarily.');
}

function shouldSkipValidation() {
    return skipValidation;
}

export { markCacheAsUpdated, shouldSkipValidation };