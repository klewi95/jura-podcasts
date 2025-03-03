// Generate star rating HTML based on rating value
function getStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars += '<i class="fas fa-star"></i>';
      } else if (i === fullStars + 1 && halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }
  
  // Get readable category name
  function getCategoryName(category) {
    const categories = {
      'zivilrecht': 'Zivilrecht',
      'strafrecht': 'Strafrecht',
      'oeffentlichesrecht': 'Öffentliches Recht',
      'legaltech': 'Legal Tech',
      'allgemein': 'Allgemein'
    };
    return categories[category] || category;
  }
  
  // Create podcast cards from data
  function createPodcastCards(podcasts) {
    const grid = document.getElementById('podcastGrid');
    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    podcasts.forEach((podcast, index) => {
      const card = document.createElement('article');
      card.className = `podcast-card ${podcast.category} fade-in`;
      card.setAttribute('data-category', podcast.category);
      card.setAttribute('data-rating', podcast.rating);
      card.style.setProperty('--delay', `${index * 0.05}s`);
      
      // Create tags HTML
      const tagsHtml = podcast.tags.map(tag => 
        `<span class="podcast-card__tag">${tag}</span>`
      ).join('');
  
      // Create streaming buttons HTML - nur anzeigen, wenn Links vorhanden sind
      const streamingButtonsHtml = `
        <div class="podcast-card__streaming">
          ${podcast.spotifyLink ? `
            <a href="${podcast.spotifyLink}" target="_blank" class="podcast-card__streaming-btn podcast-card__spotify-btn">
              <i class="fab fa-spotify"></i> Spotify
            </a>` : ''}
          ${podcast.appleLink ? `
            <a href="${podcast.appleLink}" target="_blank" class="podcast-card__streaming-btn podcast-card__apple-btn">
              <i class="fab fa-apple"></i> Apple
            </a>` : ''}
        </div>
      `;
      
      card.innerHTML = `
        <div class="podcast-card__color-tag"></div>
        <span class="podcast-card__category">${getCategoryName(podcast.category)}</span>
        <div class="podcast-card__content">
          <h3 class="podcast-card__title">
            <a href="${podcast.link}" target="_blank">${podcast.title}</a>
          </h3>
          <div class="podcast-card__rating">
            <div class="podcast-card__stars">${getStarRating(podcast.rating)}</div>
            <span class="podcast-card__rating-text">${podcast.rating.toFixed(1)}</span>
          </div>
          <p class="podcast-card__description">${podcast.description}</p>
          ${streamingButtonsHtml}
          <div class="podcast-card__recommendation">
            <i class="fas fa-book"></i>
            <span>Empfohlen: <a href="${podcast.recommendLink}" target="_blank">${podcast.recommend}</a></span>
          </div>
        </div>
        <div class="podcast-card__tags">${tagsHtml}</div>
      `;
      
      fragment.appendChild(card);
    });
    
    grid.appendChild(fragment);
    checkNoResults();
  }
  
  // Filter podcasts by category
  function filterPodcasts(category) {
    const cards = document.querySelectorAll('.podcast-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
      if (category === 'all' || card.getAttribute('data-category') === category) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-category') === category);
    });
    
    checkNoResults();
    return visibleCount;
  }
  
  // Sort podcasts by specified criteria
  function sortPodcasts(sortCriteria) {
    const grid = document.getElementById('podcastGrid');
    const sortButton = document.getElementById('sortButton');
    const isAscending = sortButton.getAttribute('data-order') === 'asc';
    const cards = Array.from(grid.querySelectorAll('.podcast-card'));
    
    if (isAscending) {
      sortButton.innerHTML = '<i class="fas fa-sort-amount-down"></i> Höchste Bewertung';
      sortButton.setAttribute('data-order', 'desc');
      cards.sort((a, b) => parseFloat(b.getAttribute('data-rating')) - parseFloat(a.getAttribute('data-rating')));
    } else {
      sortButton.innerHTML = '<i class="fas fa-sort-amount-up"></i> Niedrigste Bewertung';
      sortButton.setAttribute('data-order', 'asc');
      cards.sort((a, b) => parseFloat(a.getAttribute('data-rating')) - parseFloat(b.getAttribute('data-rating')));
    }
    
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.05}s`;
      card.classList.remove('fade-in');
      void card.offsetWidth;
      card.classList.add('fade-in');
      grid.appendChild(card);
    });
  }
  
  // Search podcasts by query
  function searchPodcasts(query) {
    const cards = document.querySelectorAll('.podcast-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const matches = text.includes(query.toLowerCase());
      
      if (matches) {
        const activeCategory = document.querySelector('.filter-tab.active').getAttribute('data-category');
        if (activeCategory === 'all' || card.getAttribute('data-category') === activeCategory) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      } else {
        card.style.display = 'none';
      }
    });
    
    checkNoResults();
    return visibleCount;
  }
  
  // Verbesserte Funktion zum Prüfen, ob Ergebnisse vorhanden sind (No-Results-Check)
  function checkNoResults() {
    requestAnimationFrame(() => {
      const visibleCards = Array.from(document.querySelectorAll('.podcast-card')).filter(card => {
        const style = window.getComputedStyle(card);
        return style.display !== 'none';
      }).length;
      
      const noResults = document.getElementById('noResults');
      noResults.style.display = visibleCards === 0 ? 'block' : 'none';
    });
  }
  
  
  // Reset all filters and search
  function resetFilters() {
    document.getElementById('searchInput').value = '';
    filterPodcasts('all');
    
    const sortButton = document.getElementById('sortButton');
    sortButton.innerHTML = '<i class="fas fa-sort"></i> Nach Bewertung';
    sortButton.setAttribute('data-order', '');
    
    fetch('podcasts.json')
      .then(response => response.json())
      .then(data => createPodcastCards(data))
      .catch(error => console.error('Error fetching podcasts:', error));
  }
  
  // Toggle view mode (grid/list)
  function toggleView(viewMode) {
    const grid = document.getElementById('podcastGrid');
    const viewButtons = document.querySelectorAll('.view-toggle-button');
    
    viewButtons.forEach(button => {
      button.classList.toggle('active', button.getAttribute('data-view') === viewMode);
    });
    
    grid.classList.toggle('list-view', viewMode === 'list');
  }
  
  // Toggle dark/light theme
  function toggleTheme() {
    const body = document.body;
    const themeSwitch = document.getElementById('themeSwitch');
    const isDarkTheme = body.getAttribute('data-theme') === 'dark';
    
    if (isDarkTheme) {
      body.setAttribute('data-theme', 'light');
      themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      body.setAttribute('data-theme', 'dark');
      themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
  
  // Initialize page with fetch
  document.addEventListener('DOMContentLoaded', function() {
    fetch('podcasts.json')
      .then(response => response.json())
      .then(data => {
        createPodcastCards(data);
        
        // Event Delegation für Filter-Tabs
        document.querySelector('.filter-tabs').addEventListener('click', event => {
          const target = event.target.closest('.filter-tab');
          if (target) {
            filterPodcasts(target.getAttribute('data-category'));
          }
        });
        
        document.getElementById('searchInput').addEventListener('input', function() {
          searchPodcasts(this.value);
        });
        
        document.getElementById('sortButton').addEventListener('click', function() {
          sortPodcasts('rating');
        });
        
        document.querySelectorAll('.view-toggle-button').forEach(button => {
          button.addEventListener('click', function() {
            toggleView(this.getAttribute('data-view'));
          });
        });
        
        document.getElementById('resetButton').addEventListener('click', resetFilters);
        
        document.getElementById('suggestButton').addEventListener('click', function() {
          window.open('https://forms.gle/YourGoogleFormLink', '_blank');
        });
        
        document.getElementById('themeSwitch').addEventListener('click', toggleTheme);
        
        window.addEventListener('scroll', function() {
          const filtersContainer = document.getElementById('filterContainer');
          const filters = document.getElementById('filters');
          filters.classList.toggle('filters--condensed', window.scrollY > 100);
        });
      })
      .catch(error => {
        console.error('Error fetching podcasts:', error);
        document.getElementById('podcastGrid').innerHTML = '<p>Fehler beim Laden der Podcasts. Bitte später erneut versuchen.</p>';
      });
  });  