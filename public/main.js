import cache from './cache.js';
import {
	errorTpl,
	orgTpl,
	reposTpl,
	repoTpl,
	contributorsTpl,
} from './templates.js';

const API_URL = 'https://api.github.com';
const USE_CACHE = true;

const render = (el, data, tpl = errorTpl, append = false) => {
	const html = tpl(data);

	if (append) {
		el.insertAdjacentHTML('beforeend', html);
	} else {
		el.innerHTML = html;
	}

	return el;
};

// TODO: refactor into something more elegant.
// Luke, use the fetch!
const getJSON = (url, callback) => {
	const isError = Math.floor(Math.random() * 10) === 0; // 10% error chance

	if (isError) {
		return callback(new Error('Extreme network error!'));
	}

	const fromCache = USE_CACHE && cache.get(url);

	if (fromCache) {
		return callback(null, fromCache);
	}

	fetch(url)
		.then((res) => {
			res.json()
				.then((json) => {
					if (USE_CACHE) {
						cache.set(url, json);
					}

					callback(null, json);
				});
		});
};

// IIFE to kick it all off
(() => {
	getJSON(`${API_URL}/orgs/vicompany`, (err, org) => {
		const el = document.querySelector('#org');

		if (err) {
			return render(el, err);
		}

		render(el, org, orgTpl);

		const { repos_url: reposUrl } = org;

		getJSON(reposUrl, (err, repos) => {
			const reposEl = document.querySelector('#repos');

			if (err) {
				return render(reposEl, { message: 'They took my repos. Dook err derr!' });
			}

			repos = repos
				.filter(r => r.fork === false)
				.sort(r => new Date(r.updated_at).getTime());

			render(reposEl, repos, reposTpl);
		});
	});

	document
		.querySelector('main')
		.addEventListener('click', (e) => {
			const { target } = e;
			const modal = document.querySelector('#modal');

			if (target.classList.contains('js-repo')) {
				e.preventDefault();

				getJSON(target.href, (err, repo) => {
					if (err) {
						return render(target, err, errorTpl);
					}

					render(modal, repo, repoTpl);

					modal.querySelector('dialog').showModal();
				});
			}

			if (target.classList.contains('js-contributors')) {
				e.preventDefault();

				getJSON(target.href, (err, contributors = []) => {
					if (err) {
						return render(target, err, errorTpl);
					}

					// TODO: retrieve user data!
					const data = {
						contributors,
						users: contributors.map(c => ({
							url: c.url,
							avatar: c.avatar_url,
							login: c.login,
						})),
					};

					render(modal, data, contributorsTpl);

					modal.querySelector('dialog').showModal();
				});
			}

			if (target.classList.contains('js-close')) {
				e.preventDefault();
				target.closest('dialog').close();
			}
		});
})();
