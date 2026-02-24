import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import './StarRating.css';

const StarRating = ({ rating, count, size = 14, showCount = true }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars.push(<FaStar key={i} className="star star--filled" style={{ fontSize: size }} />);
        } else if (rating >= i - 0.5) {
            stars.push(<FaStarHalfAlt key={i} className="star star--filled" style={{ fontSize: size }} />);
        } else {
            stars.push(<FiStar key={i} className="star star--empty" style={{ fontSize: size }} />);
        }
    }

    return (
        <div className="star-rating">
            <div className="star-rating__stars">{stars}</div>
            {showCount && count !== undefined && (
                <span className="star-rating__count">({count})</span>
            )}
        </div>
    );
};

export default StarRating;
