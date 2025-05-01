document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const bookContainer = document.getElementById('book-container');
    const loadingElement = document.getElementById('loading');
    const listViewBtn = document.getElementById('list-view');
    const gridViewBtn = document.getElementById('grid-view');
    const modal = document.getElementById('book-modal');
    const closeModal = document.querySelector('.close');
    
    // Variables
    let currentPage = 1;
    const booksPerPage = 10;
    let isLoading = false;
    let allBooks = [];
    let displayedBooks = 0;
    
    // Initialize
    fetchBooks();
    
    // Event Listeners
    listViewBtn.addEventListener('click', () => toggleView('list'));
    gridViewBtn.addEventListener('click', () => toggleView('grid'));
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    
    // Infinite Scroll
    window.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading && displayedBooks < allBooks.length) {
            loadMoreBooks();
        }
    });
    
    // Functions
    async function fetchBooks() {
        isLoading = true;
        loadingElement.style.display = 'block';
        
        try {
            // In a real app, you would fetch from an API with pagination
            // For this demo, we'll use a local books.json file
            const response = await fetch('books.json');
            const data = await response.json();
            
            allBooks = data.books;
            displayBooks();
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            isLoading = false;
            loadingElement.style.display = 'none';
        }
    }
    
    function displayBooks() {
        const startIndex = displayedBooks;
        const endIndex = Math.min(startIndex + booksPerPage, allBooks.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const book = allBooks[i];
            createBookCard(book);
        }
        
        displayedBooks = endIndex;
    }
    
    function createBookCard(book) {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.classList.add(bookContainer.classList.contains('grid-view') ? 'grid-view' : 'list-view');
        bookCard.innerHTML = `
            <img src="${book.coverUrl}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <p class="book-description">${book.description.substring(0, 150)}...</p>
            </div>
        `;
        
        bookCard.addEventListener('click', () => openModal(book));
        bookContainer.appendChild(bookCard);
    }
    
    function loadMoreBooks() {
        if (displayedBooks >= allBooks.length) return;
        
        isLoading = true;
        loadingElement.style.display = 'block';
        
        // Simulate network delay
        setTimeout(() => {
            displayBooks();
            isLoading = false;
            loadingElement.style.display = 'none';
        }, 800);
    }
    
    function toggleView(view) {
        if (view === 'list') {
            bookContainer.classList.remove('grid-view');
            bookContainer.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
        } else {
            bookContainer.classList.remove('list-view');
            bookContainer.classList.add('grid-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        }
        
        // Update all book cards
        const bookCards = document.querySelectorAll('.book-card');
        bookCards.forEach(card => {
            card.classList.remove('list-view', 'grid-view');
            card.classList.add(view + '-view');
        });
    }
    
    function openModal(book) {
        document.getElementById('modal-title').textContent = book.title;
        document.getElementById('modal-author').textContent = book.author;
        document.getElementById('modal-date').textContent = book.publishedDate;
        document.getElementById('modal-pages').textContent = book.pageCount;
        document.getElementById('modal-description').textContent = book.description;
        document.getElementById('modal-cover').src = book.coverUrl;
        document.getElementById('modal-cover').alt = book.title;
        document.getElementById('modal-read-link').href = book.readLink;
        
        modal.style.display = 'block';
    }
});

// Add this to your existing script
function handleCardClick(book) {
    // Check if it's a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;
    
    if (isTouchDevice) {
        // Add a small delay to prevent accidental clicks while scrolling
        let touchTimer;
        
        bookCard.addEventListener('touchstart', () => {
            touchTimer = setTimeout(() => {
                openModal(book);
            }, 200);
        });
        
        bookCard.addEventListener('touchend', () => {
            clearTimeout(touchTimer);
        });
    } else {
        bookCard.addEventListener('click', () => openModal(book));
    }
}

// Then update your createBookCard function to use this:
function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.classList.add(bookContainer.classList.contains('grid-view') ? 'grid-view' : 'list-view');
    bookCard.innerHTML = `
        <img src="${book.coverUrl}" alt="${book.title}" class="book-cover" loading="lazy">
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <p class="book-description">${book.description.substring(0, 150)}...</p>
        </div>
    `;
    
    handleCardClick(book); // Use the new handler
    bookContainer.appendChild(bookCard);
}