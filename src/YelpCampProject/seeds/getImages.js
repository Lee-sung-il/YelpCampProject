require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const accessKey = process.env.UNSPLASH_ACCESS_KEY;
console.log('🔑 KEY:', accessKey);

const getImages = async () => {
    const allUrls = new Set();

    try {
        for (let page = 1; allUrls.size < 200 && page <= 20; page++) {
            const res = await axios.get('https://api.unsplash.com/search/photos', {
                params: {
                    query: 'camping',
                    per_page: 30,
                    page: page,
                    orientation: 'landscape'
                },
                headers: {
                    Authorization: `Client-ID ${accessKey}`
                }
            });

            const newUrls = res.data.results.map(photo => photo.urls.regular);
            newUrls.forEach(url => allUrls.add(url)); // Set은 중복 제거됨

            console.log(`✅ Page ${page}에서 ${newUrls.length}개 가져옴 (누적 ${allUrls.size}개)`);
        }

        const urlsArray = Array.from(allUrls).slice(0, 200); // 혹시 200개 초과되면 잘라내기
        const outputPath = path.join(__dirname, 'campingImages.json');
        fs.writeFileSync(outputPath, JSON.stringify(urlsArray, null, 2));
        console.log('✅ 이미지 200개 저장 완료!');
    } catch (err) {
        console.error('❌ 에러:', err.message);
    }
};

getImages();