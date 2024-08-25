let currentPage = 1;

async function fetchCharactersByPage(page) {
	try {
		const response = await fetch(
			`https://rickandmortyapi.com/api/character?page=${page}`
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Ошибка при запросе данных:", error);
	}
}

async function getEpisodeNames(episodeUrls) {
	try {
		//! Создаем массив промисов для получения данных о каждом эпизоде
		const episodePromises = episodeUrls.map((url) =>
			fetch(url).then((res) => res.json())
		);
		//! Ожидаем завершения всех промисов и возвращаем имена эпизодов, объединенные запятыми
		const episodes = await Promise.all(episodePromises);
		return episodes.map((episode) => episode.name).join(", ");
	} catch (error) {
		console.error("Ошибка при получении имен эпизодов:", error);
		return "Неизвестно";
	}
}

async function renderCharactersByPage(page) {
	try {
		const data = await fetchCharactersByPage(page);
		const characters = data.results;
		const characterContainer = document.getElementById("character-container");

		if (!characterContainer) {
			console.error("Контейнер для персонажей не найден на странице.");
			return;
		}

		if (page === 1) {
			characterContainer.innerHTML = ""; //* Очищаем контейнер при первой загрузке
		}

		let totalEpisodes = 0;
		const uniqueLocations = new Set();

		for (const character of characters) {
			const characterCard = document.createElement("div");
			characterCard.className = "character-card";

			let episodeNames = "Неизвестно";
			if (typeof getEpisodeNames === "function") {
				episodeNames = await getEpisodeNames(character.episode);
				totalEpisodes += character.episode.length; //* Добавляем количество эпизодов для этого персонажа

				//* Ограничиваем текст до 50 символов
				episodeNames = truncateText(episodeNames, 100);
			} else {
				console.error("Функция getEpisodeNames не определена.");
			}

			//* Добавляем локацию в Set для отслеживания уникальных значений
			uniqueLocations.add(character.location.name);

			characterCard.innerHTML = `
                <img src="${character.image}" alt="${character.name}">
                <div class="character-info">
                  <h2>${character.name}</h2>
                  <p><strong>Location:</strong> ${character.location.name}</p>
                  <p><strong>Episodes:</strong> ${episodeNames}</p>
                </div>
            `;

			characterContainer.appendChild(characterCard);
		}

		//*  Обновляем количество персонажей в футере
		const characterCount = document.getElementById("character-count");
		characterCount.textContent = characterContainer.children.length;

		//* Обновляем количество эпизодов в футере
		const episodeCount = document.getElementById("episode-count");
		episodeCount.textContent = totalEpisodes;

		//* Обновляем количество уникальных локаций в футере
		const locationCount = document.getElementById("location-count");
		locationCount.textContent = uniqueLocations.size;

		//* Проверяем, есть ли следующая страница и отображаем кнопку
		if (data.info.next) {
			document.getElementById("load-more").style.display = "block";
		} else {
			document.getElementById("load-more").style.display = "none";
		}
	} catch (error) {
		console.error("Ошибка при рендеринге персонажей:", error);
	}
}

document.getElementById("load-more").addEventListener("click", () => {
	currentPage++;
	renderCharactersByPage(currentPage);
});

//! Первоначальный рендеринг
renderCharactersByPage(currentPage);

function truncateText(text, maxLength) {
	if (text.length > maxLength) {
		return text.substring(0, maxLength) + "...";
	} else {
		return text;
	}
}
