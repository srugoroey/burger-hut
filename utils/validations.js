const VALID_LOCATION_FIELDS = ["lat", "lon"];
const UNUPDATEABLE_FIELDS = ["city", "address", "location"]

function validateCoordinates(lat, lon) {
    const isLatValid = lat >= -90 && lat <= 90;
    const isLonValid = lon >= -180 && lon <= 180;
    return isLatValid && isLonValid;
}

function validateLocationObject(location) {
    if (typeof location !== 'object' || location === null || Array.isArray(location) || Object.keys(location).length !== 2) {
        return false;
    }
    return true;
}

function getLocationInvalidKeyCount(locationKeys) {
    let invalidKeyCount = 0;
    locationKeys.forEach((key) => {
        if (typeof key !== 'number' || !isFinite(key) || !VALID_LOCATION_FIELDS.includes(key)) {
            invalidKeyCount += 1;
        }
    });
    return invalidKeyCount;
}
function validateLocation(location) {
    const locationKeys = Object.keys(location);
    return validateLocationObject(location) && getLocationInvalidKeyCount(locationKeys) && validateCoordinates(location.lat, location.lon);
}

function validatePhoneNumber(phoneNumber) {
    return typeof(phoneNumber) === 'string' && /^\d{9,10}$/.test(phoneNumber);
}

function areFieldsUpdatable(data) {
    Object.keys(data).forEach((key) => {
        if(UNUPDATEABLE_FIELDS.includes(key)) {
          return false;
        }
    })
    return true;
}

module.exports = {
    validateLocation,
    validatePhoneNumber,
    areFieldsUpdatable
};
  