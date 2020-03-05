import cache from './lib/cache.js';
import {
	render,
	renderError,
	orgTpl,
	reposTpl,
	repoTpl,
	contributorsTpl,
} from './templates.js';

const API_URL = 'https://api.github.com/orgs/vicompany';
const USE_CACHE = true;

async function getJSON(url) {
	const fromCache = USE_CACHE && cache.get(url);

	if (fromCache) {
		return fromCache;
	}

	try {
		const response = await fetch(url); // fetch the url and await its response
		const data = await response.json(); // wait for the response and turn it into json

		if (USE_CACHE) {
			cache.set(url, data);
		}

		return data;
	} catch (error) {
		renderError(error);
	}
}

async function init() {
	const companyData = await getJSON(API_URL);
	let repositoryData = await getJSON(`${companyData.repos_url}`);

	repositoryData = repositoryData
		.filter(r => r.fork === false) // No forks, no forks!
		.sort(r => new Date(r.updated_at).getTime());

	const companyEl = document.querySelector('#org');
	const reposEl = document.querySelector('#repos');

	render(companyEl, companyData, orgTpl);
	render(reposEl, repositoryData, reposTpl);
}

init();


// const getRepos = (url, callback) => {
// 	getJSON(url, (err, repos = []) => {
// 		if (err) {
// 			return callback(new Error('They took my repos. Dook err derr!'));
// 		}

// 		repos = repos
// 			.filter(r => r.fork === false) // No forks, no forks!
// 			.sort(r => new Date(r.updated_at).getTime());

// 		callback(null, repos);
// 	});
// };

// // IIFE to kick it all off
// (() => {
// 	getJSON(`${API_URL}/orgs/vicompany`, (err, org) => {
// 		const el = document.querySelector('#org');

// 		if (err) {
// 			return renderError(err);
// 		}

// 		render(el, org, orgTpl);

// 		const { repos_url: reposUrl } = org;

// 		getRepos(reposUrl, (err, repos) => {
// 			const reposEl = document.querySelector('#repos');

// 			if (err) {
// 				return renderError(err);
// 			}

// 			render(reposEl, repos, reposTpl);
// 		});
// 	});

// 	document
// 		.querySelector('main')
// 		.addEventListener('click', (e) => {
// 			const { target } = e;
// 			const modal = document.querySelector('#modal');

// 			if (target.classList.contains('js-repo')) {
// 				e.preventDefault();

// 				getJSON(target.href, (err, repo) => {
// 					if (err) {
// 						return renderError(err);
// 					}

// 					render(modal, repo, repoTpl);

// 					modal.querySelector('dialog').showModal();
// 				});
// 			}

// 			if (target.classList.contains('js-contributors')) {
// 				e.preventDefault();

// 				getJSON(target.href, (err, contributors = []) => {
// 					if (err) {
// 						return renderError(err);
// 					}

// 					// TODO: get user data from all contributers e.g. https://api.github.com/users/svensigmond
// 					// and replace the 'users' array with this real data.
// 					const data = {
// 						contributors,
// 						users: contributors.map(c => ({
// 							url: c.url,
// 							avatar: c.avatar_url,
// 							login: c.login,
// 						})),
// 					};

// 					render(modal, data, contributorsTpl);

// 					modal.querySelector('dialog').showModal();
// 				});
// 			}

// 			if (target.classList.contains('js-modal-close')) {
// 				e.preventDefault();
// 				target.closest('dialog').close();
// 			}
// 		});
// })();
