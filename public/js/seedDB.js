const firebase = require('firebase-admin');
const serviceAccount = require('../../editted-ucsd-firebase-adminsdk.json');
const https = require('https');

// Initialize Firebase
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://editted-ucsd.firebaseio.com"
});
const firebaseDB = firebase.database(); // reference to Firestore Realtime DB

// Image URLs of dogs lacking a proper photo in TheDogAPI
const imageURLs = {
    // Dogs without a photo
    "Australian Cattle Dog" : "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Australian_Cattle_Dog_Naava.jpg/1024px-Australian_Cattle_Dog_Naava.jpg",
    "Bearded Collie" : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Bearded_Collie.jpg/640px-Bearded_Collie.jpg",
    "Border Collie" : "https://cdn.pixabay.com/photo/2016/01/29/13/00/border-collie-1167898_960_720.jpg",
    "Bull Terrier" : "https://cdn.pixabay.com/photo/2018/08/27/03/20/dog-3633958_960_720.jpg",
    "Chesapeake Bay Retriever" : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Chesapeake_Bay_Retriever1.jpg/1004px-Chesapeake_Bay_Retriever1.jpg",
    "Cocker Spaniel" : "https://upload.wikimedia.org/wikipedia/commons/7/70/EnglishCockerSpaniel_simon.jpg",
    "Finnish Spitz" : "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/FINNISH_SPITZ.jpg/858px-FINNISH_SPITZ.jpg",
    "Kooikerhondje" : "https://upload.wikimedia.org/wikipedia/commons/f/f0/Kooiker03.jpg",
    "Saint Bernard" : "https://upload.wikimedia.org/wikipedia/commons/4/44/Saint-bernard-standing.jpg",
    "Saluki" : "https://cdn.pixabay.com/photo/2019/02/27/11/54/saluki-4023919_960_720.jpg",
    "Shiba Inu" : "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Taka_Shiba.jpg/640px-Taka_Shiba.jpg",
    "Standard Schnauzer" : "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Standard_Schnauzers.jpg/640px-Standard_Schnauzers.jpg",
    "Thai Ridgeback" : "https://upload.wikimedia.org/wikipedia/commons/d/d6/Thai-Ridgeback.jpg",
    "Tibetan Terrier" : "https://cdn.pixabay.com/photo/2019/02/23/17/50/tibetan-terrier-4016152_960_720.jpg",

    // Dogs with a poor photo
    "Appenzeller Sennenhund" : "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Abora_z_Velk%C3%A9ho_%C3%9Ajezda5.jpg/880px-Abora_z_Velk%C3%A9ho_%C3%9Ajezda5.jpg",
    "Bloodhound" : "https://upload.wikimedia.org/wikipedia/commons/5/52/Cachorro_Bloodhound.jpg",
    "Catahoula Leopard Dog" : "https://upload.wikimedia.org/wikipedia/commons/d/d1/Louisiana_Catahoula_Leopard_Dog_-_Red_Leopard.jpg",
    "English Toy Spaniel" : "https://upload.wikimedia.org/wikipedia/commons/a/a7/English_Toy_Spaniel_Cropped.jpg",
    "Great Dane" : "https://www.publicdomainpictures.net/pictures/40000/nahled/great-dane-dog-1365445651zZJ.jpg",
};


const seedDB = () => {
    const dogIds = [];
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
                    if (!(data.breed in imageURLs)) {
                        dogIds.push(breedInfo.id)
                    } 
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

    // Manually add images of dogs lacking a proper photo in TheDogAPI
    Object.keys(imageURLs).forEach( breed => {
        firebaseDB.ref(`breedInfo/${breed}/image`).set(imageURLs[breed]);
    });
};

module.exports = seedDB;