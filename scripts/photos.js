/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

const FS = require('fs');
const Glob = require('glob');
const YAML = require('js-yaml');
const fetch = require('isomorphic-unfetch');
const Path = require('path');
const Sharp = require('sharp');
const { ExifImage } = require('exif');
const moment = require('moment');
const { allPhotosInDocument } = require('../utils/allPhotosInDocument');
const crypto = require('crypto');

const regenerate = process.argv.indexOf('-r') !== -1;

const indexFilePath = 'public/photos/index.json';

const index = FS.existsSync(indexFilePath) ? JSON.parse(FS.readFileSync(indexFilePath)) : {};

const addSrc = src => {
    if (index[src] === undefined) index[src] = {};
    index[src].hash = crypto.createHash('md5').update(src).digest('hex');
    index[src].ext = Path.extname(src).toLowerCase();
};

[
    'https://live.staticflickr.com/65535/48834525112_d1e4807566_b.jpg',
    'https://live.staticflickr.com/4770/24937209447_534080ac2c_b.jpg',
    'https://live.staticflickr.com/7048/6900662391_540daa3667_b.jpg',
    'https://farm4.staticflickr.com/3934/14917023204_4901668606_b.jpg',
].forEach(addSrc);

console.log('Loading YAML:');

['attractions', 'campsites', 'parks', 'routes'].forEach(category => {
    Glob.sync(`public/docs/${category}/**/*.yaml`).forEach(fpath => {
        console.log(' ', fpath);
        const doc = YAML.safeLoad(FS.readFileSync(fpath));
        const photos = allPhotosInDocument(doc);
        // console.log(photos);
        photos.forEach(({ src }) => addSrc(src));
    });
});

const cacheFilePath = url => Path.join('public/photos/orig', index[url].hash) + index[url].ext;

const resizedFilePath = (url, dir) => Path.join('public/photos', dir, index[url].hash) + '.jpg';

const dmsToDecimal = ([d, m, s]) => (d + m / 60 + s / 3600).toFixed(6);

const extractExif = url =>
    new Promise(resolve => {
        // TODO: Also extract license info: https://wiki.creativecommons.org/wiki/XMP
        if (regenerate || index[url].exif === undefined) {
            /* eslint-disable no-new */
            new ExifImage(
                {
                    image: cacheFilePath(url),
                },
                (error, data) => {
                    if (error) {
                        index[url].exif = false;
                    } else {
                        if ('DateTimeOriginal' in data.exif) {
                            index[url].year = moment(
                                data.exif.DateTimeOriginal,
                                'YYYY:MM:DD HH:mm:ss',
                            ).year();
                        }
                        if ('GPSLatitude' in data.gps) {
                            index[url].location = [
                                dmsToDecimal(data.gps.GPSLatitude) *
                                    (data.gps.GPSLatitudeRef === 'N' ? 1 : -1),
                                dmsToDecimal(data.gps.GPSLongitude) *
                                    (data.gps.GPSLongitudeRef === 'E' ? 1 : -1),
                            ];
                            console.log(`LOCATION: ${JSON.stringify(index[url].location)}`);
                        }
                        index[url].exif = true;
                    }
                    resolve();
                },
            );
            /* eslint-enable no-new */
        } else {
            resolve();
        }
    });

const resizeFile = (url, dir, options) =>
    new Promise(resolve => {
        const path = cacheFilePath(url);
        const outFile = resizedFilePath(url, dir);
        if (regenerate || !FS.existsSync(outFile)) {
            // https://sharp.pixelplumbing.com/api-resize
            Sharp(path)
                .resize(options)
                .toFormat('jpg')
                .toFile(outFile, err => {
                    if (err) {
                        console.log(`ERROR! (${dir})`);
                    } else {
                        console.log(`RESIZED OK (${dir})`);
                    }
                    resolve();
                });
        } else {
            resolve();
        }
    });

// https://stackoverflow.com/a/51302466/5165
const downloadFile = async url => {
    const path = cacheFilePath(url);
    if (regenerate || !FS.existsSync(path)) {
        console.log(`DOWNLOADING: ${url}`);
        const res = await fetch(url);
        const fileStream = FS.createWriteStream(path);
        await new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on('error', err => {
                console.log(`ERROR: ${url}`);
                reject(err);
            });
            fileStream.on('finish', () => {
                console.log(`OK: ${url}`);
                resolve();
            });
        });
    } else {
        console.log(`EXISTS: ${url}`);
    }
};

const processFile = async url => {
    await downloadFile(url);
    await Promise.all([
        extractExif(url),
        resizeFile(url, 'sm', {
            width: 640,
            height: 480,
            fit: Sharp.fit.inside,
        }),
        resizeFile(url, 'lg', {
            width: 1400,
            height: 800,
            fit: Sharp.fit.inside,
        }),
    ]);
};

Promise.all(Object.keys(index).map(url => processFile(url))).then(() => {
    console.log('Done!');
    FS.writeFileSync(indexFilePath, JSON.stringify(index, null, 4));
});
