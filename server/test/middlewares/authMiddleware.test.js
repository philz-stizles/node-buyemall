const expect = require('chai').expect;
const sinon = require('sinon')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../../middlewares/authMiddleware');


describe('The Authentication Middleware', () => {
    // You can also have nested describes
    it('should throw an error if no "Authorization header" is null', () => {
        const reqMock = {
            get: function(headerName) {
                return null
            }
        }

        const resMock = {}
        const nextMock = () => {}

        expect(authMiddleware.bind(this, reqMock, resMock, nextMock)).to.throw('Not authenticated')
    })


    it('should throw an error if "Authorization header" is only one string', () => {
        const reqMock = {
            get: function(headerName) {
                return 'testtoken'
            }
        }
        const resMock = {}
        const nextMock = () => {}

        expect(authMiddleware.bind(this, reqMock, resMock, nextMock)).to.throw()
    })

    it('should throw an error if the token cannot be verified', () => {
        const reqMock = {
            get: function(headerName) {
                return 'Bearer invalidtoken'
            }
        }
        const resMock = {}
        const nextMock = () => {}

        expect(authMiddleware.bind(this, reqMock, resMock, nextMock)).to.throw()
    })

    it('should yield a userId after decoding a valid token', () => {
        const reqMock = {
            get: function(headerName) {
                return 'Bearer validtoken'
            }
        }
        const resMock = {}
        const nextMock = () => {}

        sinon.stub(jwt, 'verify')
        jwt.verify.returns({ id: 'validtoken' })

        authMiddleware(reqMock, resMock, nextMock)

        expect(jwt.verify.called).to.be.true
        expect(reqMock).to.have.property('userId')
        expect(reqMock).to.have.property('userId', 'validtoken')

        jwt.verify.restore()
    })
})
