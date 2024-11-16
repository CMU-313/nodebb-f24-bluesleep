'use strict';

const fetch = require('node-fetch');

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
    // Update the translator URL to the correct endpoint
    const TRANSLATOR_API = 'https://bluesleep-ai.openai.azure.com/';  // Correct endpoint
    const response = await fetch(`${TRANSLATOR_API}/?content=${postData.content}`);
    const data = await response.json();
    return [data.is_english, data.translated_content];
};
