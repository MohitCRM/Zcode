const validateGuestStats = (elo, acceptedSubmissions, wrongSubmissions) => {
    // Validate Elo
    if (elo !== undefined) {
        if (typeof elo !== 'number' || elo < 0 || elo > 5000) {
            throw new Error("Elo must be a valid number between 0 and 5000.");
        }
    }

    // Validate Accepted Submissions
    if (acceptedSubmissions !== undefined) {
        if (typeof acceptedSubmissions !== 'number' || acceptedSubmissions < 0 || acceptedSubmissions > 10000) {
            throw new Error("Accepted submissions must be a valid number between 0 and 10000.");
        }
    }

    // Validate Wrong Submissions
    if (wrongSubmissions !== undefined) {
        if (typeof wrongSubmissions !== 'number' || wrongSubmissions < 0 || wrongSubmissions > 10000) {
            throw new Error("Wrong submissions must be a valid number between 0 and 10000.");
        }
    }

    return true;
};

module.exports = { validateGuestStats };
