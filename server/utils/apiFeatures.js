// API Features helper for pagination, filtering, sorting, and search
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Filter by fields (e.g., ?category=xyz&price[gte]=100)
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'featured'];
        excludedFields.forEach((field) => delete queryObj[field]);

        // Remove empty string values to prevent MongoDB ObjectId cast errors
        // e.g. ?category= would fail if passed as an empty string to an ObjectId field
        Object.keys(queryObj).forEach((key) => {
            if (queryObj[key] === '' || queryObj[key] === null || queryObj[key] === undefined) {
                delete queryObj[key];
            }
            // Also clean nested objects like price[gte]=""
            if (typeof queryObj[key] === 'object' && queryObj[key] !== null) {
                Object.keys(queryObj[key]).forEach((subKey) => {
                    if (queryObj[key][subKey] === '') delete queryObj[key][subKey];
                });
                if (Object.keys(queryObj[key]).length === 0) delete queryObj[key];
            }
        });

        // Handle advanced filtering (gte, gt, lte, lt)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    // Sort results (e.g., ?sort=-price,rating)
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    // Pagination (e.g., ?page=2&limit=12)
    paginate() {
        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = parseInt(this.queryString.limit, 10) || 12;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        this.page = page;
        this.limit = limit;
        return this;
    }

    // Select specific fields (e.g., ?fields=name,price,rating)
    selectFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        return this;
    }
}

module.exports = APIFeatures;
