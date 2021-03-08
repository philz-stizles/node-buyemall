const expect = require('chai').expect;
const authMiddleware = require('./../../middlewares/auth-middleware');

describe('The Authentication Middleware', () => {
    it('should throw an error if no "Authorization header" is null', () => {
        const reqMock = {
            get: function(headerName) {
                return null
            }
        }

        expect(authMiddleware.bind(this, reqMock, {}, () => {})).to.throw('Not authenticated')
    })


    it('should throw an error if "Authorization header" is only one string', () => {
        const reqMock = {
            get: function(headerName) {
                return 'testtoken'
            }
        }

        expect(authMiddleware.bind(this, reqMock, {}, () => {})).to.throw()
    })
})
