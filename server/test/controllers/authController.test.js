const expect = require('chai').expect
const sinon = require('sinon')
const mongoose = require('mongoose')
// const User = require('./../../models/User')
const{ login } = require('../../controllers/authController')

describe('The Auth Controller', () => {
    describe('Login', () => {
        it('should throw error if DB operation fails', async () => {
            const reqMock = {
                body: {
                    email: 'test@mail.com',
                    password: 'testpassword'
                }
            }
            const resMock = {}
            const nextMock = () => {}
            
            var mockFindOne = {
                where: function () {
                    return this;
                },
                equals: function () {
                    return this;
                },
                exec: function (callback) {
                    callback(null, "some fake expected return value");
                }
            };

            const t = sinon.stub(mongoose.Model, 'findOne').returns(mockFindOne)
            t.throws()
    
            const result = await login(reqMock, resMock, nextMock)
    
            expect(result).to.be.an('error')
            expect(result).to.have.property('statusCode')
    
            User.findOne.restore()
        })
    })
})
