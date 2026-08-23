const { StatusCodes } = require('http-status-codes');

const notFound = (req, res) => {
	res.status(StatusCodes.NOT_FOUND).json({
		message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
	});
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
	if (err.name === 'CastError') {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: 'Identificador inválido' });
	}

	if (err.name === 'ValidationError') {
		return res
			.status(StatusCodes.UNPROCESSABLE_ENTITY)
			.json({ message: err.message });
	}

	console.error(err);
	res
		.status(StatusCodes.INTERNAL_SERVER_ERROR)
		.json({ message: 'Erro interno do servidor' });
};

module.exports = { notFound, errorHandler };
