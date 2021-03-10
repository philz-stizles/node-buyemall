const User = require('../models/User')

exports.signup = (req, res) => {
    const { username, email, password } = req.body

    const user = new User({ username, email, password })

    user.save()
        .then((result) => {
            if(result.affectedRows <= 0) return res.status(500).send({ status: false, message: 'Could not create user, try again later' })
            res.status(201).send({ status: true, data: result.insertId, message: 'Signup successful' })
        })  
        .catch(error => {
            console.error(error)
            return res.status(500).send({ status: false, message: 'Could not create user, try again later' })
        })
}

exports.login = (req, res) => {

}