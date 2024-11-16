'use strict';

const fetch = require('node-fetch');

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
	const TRANSLATOR_API = 'https://bluesleep-ai.openai.azure.com/';
	const response = await fetch(`${TRANSLATOR_API}/?content=${postData.content}`);
	const data = await response.json();
	return [data.is_english, data.translated_content];
};
