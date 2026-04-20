// Flexible role-based authorization middleware
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({
                message: `Not authorized. Required roles: ${allowedRoles.join(', ')}`
            });
        }
    };
};

module.exports = { authorize };