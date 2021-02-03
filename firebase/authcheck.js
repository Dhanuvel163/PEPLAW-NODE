let authCheck ={} 
authCheck.authUser = (req, res, next) => {
	if (!req.headers.authorization) {
		const error = new Error('User Not Authenticated!')
		error.code = 403
		throw error
	}
	UserappAuth
		.verifyIdToken(req.headers.authorization)
		.then((decodedToken) => {
			req.uid = decodedToken
			next()
		})
		.catch((err) => {
            res.json({
            success: false,
            message: 'Failed to authenticate token'
            });
		})
}
authCheck.authLawyer = (req, res, next) => {
	if (!req.headers.authorization) {
		const error = new Error('Lawyer Not Authenticated!')
		error.code = 403
		throw error
	}
	LawyerappAuth
		.verifyIdToken(req.headers.authorization)
		.then((decodedToken) => {
			req.uid = decodedToken
			next()
		})
		.catch((err) => {
			console.log(err.message)
            res.json({
            success: false,
            message: 'Failed to authenticate token'
            });
		})
}
module.exports = authCheck

// export const verifyClaim = (idToken, claim) => {
// 	adminAuth
// 		.verifyIdToken(idToken)
// 		.then((claims) => {
// 			if (claim in claims) {
// 				return true
// 			} else return false
// 		})
// 		.catch((err) => {
// 			const error = new Error(err.message)
// 			error.code = 400
// 			throw error
// 		})
// }
