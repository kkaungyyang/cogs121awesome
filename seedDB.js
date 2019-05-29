const firebase = require('firebase-admin');
const serviceAccount = require('./editted-ucsd-firebase-adminsdk.json');
const https = require('https');

// Initialize Firebase
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://editted-ucsd.firebaseio.com"
});
const firebaseDB = firebase.database(); // reference to Firestore Realtime DB


const dogIds = [];
const seedDB = () => {
    const options = {
        host: 'api.thedogapi.com',
        path: '/v1/breeds',
        Connection: 'keep-alive'
    };
    options['x-api-key'] = 'a9e1cbf4-a8ac-41c3-9c30-06368bb36e0a';
    // Request data from TheDogAPI
    https.get(options, (res) => {
        console.log(`Successful request to TheDogAPI`);
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                console.log(`Received data on ${parsedData.length} breeds of dogs.`);

                // Add info on each breed of dog to DB
                console.log(`Writing data on ${parsedData.length} breeds of dogs to firebase.`);
                for (let breedInfo of parsedData) {
                    const data = {
                        breed: breedInfo.name,
                        temperament: breedInfo.temperament || '',
                        breed_for: breedInfo.bred_for || '',
                        life_span: breedInfo.life_span || '',
                        weight: `${breedInfo.weight.imperial} lb OR ${breedInfo.weight.metric} kg` || '',
                        height: `${breedInfo.height.imperial} in OR ${breedInfo.height.metric} cm` || ''
                    }
                    dogIds.push(breedInfo.id)
                    firebaseDB.ref('breedInfo/' + data.breed).set(data);
                }
                seedImages(dogIds);
            } catch (e) {
                console.error(`Error parsing data: ${e.message}`);
            }
        });

    }).on('error', (err) => {
        console.error(`Error while requesting TheDogAPI api: ${err.message}`);
    })
}

const seedImages = (dogIds) => {
    console.log('---- Expect some errors below since not all dogs have images in TheDogAPI ----');
    dogIds.forEach(id => {
        let option = {
            host: 'api.thedogapi.com',
            path: `/v1/images/search?size=small&format=json&breed_id=${id}`,

        };
        option['x-api-key'] = 'a9e1cbf4-a8ac-41c3-9c30-06368bb36e0a';

        // Request data from TheDogAPI
        https.get(option, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    const breed = parsedData[0].breeds[0].name;
                    firebaseDB.ref(`breedInfo/${breed}/image`).set(parsedData[0].url);
                } catch (e) {
                    console.error(`Error parsing data of dog id ${id} : ${e.message}`);
                }
            });
        }).on('error', (err) => {
            console.error(`Error while requesting TheDogAPI api: ${err.message}`);
        });
    });
};

module.exports = seedDB;