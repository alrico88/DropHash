const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const polyhash = require('geohash-poly');
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {title: 'DropHash'});
});

router.post('/file-upload', upload.single('file'), async (req, res) => {
	try {
		let path = req.file.path;
		let precision = req.headers.precision;
		let result = await getAllHashes(path, precision);
		removeFile(path);
		res.send(result);
	} catch (err) {
		res.send(err);
	}
});

async function getAllHashes(path, precision) {
	let file = fs.readFileSync(path);
	let json = JSON.parse(file);

	let promisesArray = [];

	for (let feature of json.features) {
		promisesArray.push(new Promise((resolve, reject) => {
				findHashesInside(
					feature.geometry.coordinates,
					parseInt(precision),
					(err, hashes) => {
						if (err) {
							reject(err);
						} else {
							resolve({
								name: feature.properties,
								hashes: hashes,
							});
						}
					}
				);
			}));
	}

	try {
		let result = await Promise.all(promisesArray);
		return result;
	} catch (err) {
		throw err;
	}
}

function findHashesInside(polygon, precision, callback) {
	polyhash(
		{
			coords: polygon,
			precision: precision,
		},
		(err, hashes) => {
			callback(err, hashes);
		}
	);
}

function removeFile(path) {
	fs.unlinkSync(path);
}

module.exports = router;
