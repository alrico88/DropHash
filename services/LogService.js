const winston = require('winston');

if (
	process.env.NODE_ENV == null ||
	process.env.NODE_ENV === 'development' ||
	process.env.NODE_LOG_LEVEL === 'debug'
) {
	winston.level = 'debug';
}

class LogService {
	debug(message, extra) {
		winston.debug(message, extra);
	}

	info(message, extra) {
		winston.info(message, extra);
	}

	warning(message, extra) {
		winston.warn(message, extra);
	}

	error(message, extra) {
		winston.error(message, extra);
	}

	critical(message, extra) {
		winston.crit(message, extra);
	}

	/**
	 * Logs a query to the DB
	 * @param {String} message
	 * @param {Object} query
	 * @memberof LogService
	 */
	logQuery(message, query) {
		this.info(message + ' query');
		this.debug(message + ' query', JSON.stringify(query, null, 2));
	}

	/**
	 * Logs results from the DB
	 * @param {String} message
	 * @param {Object} results
	 * @memberof LogService
	 */
	logResults(message, results) {
		// this.info(message + " results");
		// this.debug(message + " query", JSON.stringify(results, null, 2));
	}

	/**
	 * Logs errors
	 * @param {String} message
	 * @param {*} exception
	 * @memberof LogService
	 */
	logException(message, exception) {
		this.error(message, exception);
	}

	/**
	 * Logs what collection is chosen for a query
	 * @param {String} kpi
	 * @param {String} geoLevel
	 * @param {String} collection
	 * @memberof LogService
	 */
	logCollection(kpi, geoLevel, collection) {
		this.debug(`The query for ${kpi}, at level ${geoLevel} is using ${collection} collection`);
	}
}

module.exports = LogService;
