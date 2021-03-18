import React from 'react'
import PropTypes from 'prop-types'
import './Paginator.css';

const Paginator = ({ children, currentPage, lastPage, onPrevious, onNext }) => {
    console.log(currentPage)
    console.log(lastPage)
    return (
        <div className="paginator">
            {children}
            <div className="paginator__controls">
                {currentPage > 1 && <button className="paginator__control" onClick={onPrevious}>Previous</button>}
                {currentPage < lastPage && <button className="paginator__control" onClick={onNext}>Next</button>}
            </div>
        </div>
    )
}

Paginator.propTypes = {
    currentPage: PropTypes.number.isRequired,
    lastPage: PropTypes.number.isRequired,
    onPrevious: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
}

export default Paginator
