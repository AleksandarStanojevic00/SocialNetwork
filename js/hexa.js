const session = new Session();
const session_id = session.getSession();

if (session_id === '') {
    window.location.href = '/';
}

const usernameEl = document.querySelector('#username');
const emailEl = document.querySelector('#email');
const editUsernameInput = document.querySelector('#korisnicko_ime');
const editEmailInput = document.querySelector('#edit_email');
const postForm = document.querySelector('#postForm');
const postContentEl = document.querySelector('#postContent');
const allPostsWrapper = document.querySelector('#allPostsWrapper');
const deleteProfileBtn = document.querySelector('#deleteProfile');

let currentUserData = null;
let closeModal = () => {};

async function populateUserData() {
    const user = new User();
    currentUserData = await user.get(session_id);

    usernameEl.innerText = currentUserData.username;
    emailEl.innerText = currentUserData.email;
    editUsernameInput.value = currentUserData.username;
    editEmailInput.value = currentUserData.email;
}

function formatPostDate(rawDate) {
    if (!rawDate) {
        return 'Just now';
    }

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
        return 'Just now';
    }

    return parsed.toLocaleString();
}

function normalizeLikedBy(rawValue) {
    if (Array.isArray(rawValue)) {
        return rawValue.map(value => String(value));
    }

    if (typeof rawValue === 'string' && rawValue.trim() !== '') {
        return rawValue.split(',').map(value => value.trim()).filter(Boolean);
    }

    return [];
}

function renderPosts(posts) {
    if (!allPostsWrapper) {
        return;
    }

    if (!posts.length) {
        allPostsWrapper.innerHTML = '<p class="posts-empty">No posts yet. Be the first to publish.</p>';
        return;
    }

    allPostsWrapper.innerHTML = posts.map(post => {
        const isMine = String(post.user_id) === String(session_id);
        const likedBy = normalizeLikedBy(post.liked_by);
        const isLikedByCurrentUser = likedBy.includes(String(session_id));
        const likeCount = Number(post.likes || likedBy.length || 0);
        const safeContent = (post.content || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

        return `
            <article class="post-card" data-post-id="${post.id}">
                <header class="post-card-header">
                    <p class="post-author">${post.username || 'Unknown user'}</p>
                    <p class="post-date">${formatPostDate(post.created_at)}</p>
                </header>
                <p class="post-text">${safeContent}</p>
                <div class="post-actions">
                    <button class="post-like-btn ${isLikedByCurrentUser ? 'liked' : ''}" type="button" data-action="like" data-post-id="${post.id}">
                        ${isLikedByCurrentUser ? 'Liked' : 'Like'} <span class="post-like-count">${likeCount}</span>
                    </button>
                    ${isMine ? `<button class="post-delete-btn" type="button" data-action="delete" data-post-id="${post.id}">Delete</button>` : ''}
                </div>
            </article>
        `;
    }).join('');
}

async function loadPosts() {
    try {
        const post = new Post();
        const posts = await post.getAll();
        renderPosts(posts);
    } catch (error) {
        console.error('Loading posts failed:', error);
        if (allPostsWrapper) {
            allPostsWrapper.innerHTML = '<p class="posts-empty">Failed to load posts.</p>';
        }
    }
}

document.querySelector('#logout').addEventListener('click', e => {
    e.preventDefault();
    session.destroySession();
    window.location.href = '/';
});

const modal = document.querySelector('.custom-modal');
const editAccountBtn = document.querySelector('#editAccount');
const closeModalBtn = document.querySelector('#closeModal');

if (modal && editAccountBtn && closeModalBtn) {
    const openModal = () => {
        modal.style.display = 'flex';
        modal.classList.add('active');
    };

    closeModal = () => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    };

    editAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    closeModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

document.querySelector('#editForm').addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn = e.currentTarget.querySelector('button[type="submit"], button:not(#closeModal)');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
    }

    const user = new User();
    user.username = editUsernameInput.value;
    user.email = editEmailInput.value;

    try {
        const updatedUser = await user.edit();
        currentUserData = updatedUser;
        usernameEl.innerText = updatedUser.username;
        emailEl.innerText = updatedUser.email;
        closeModal();
    } catch (error) {
        console.error('Edit submit failed:', error);
        alert(error.message || 'Edit failed. Please try again.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Edit';
        }
    }
});

if (deleteProfileBtn) {
    deleteProfileBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const confirmed = window.confirm('Are you sure you want to delete your profile? This action cannot be undone.');
        if (!confirmed) {
            return;
        }

        const originalText = deleteProfileBtn.textContent;
        deleteProfileBtn.disabled = true;
        deleteProfileBtn.textContent = 'Deleting...';

        try {
            const user = new User();
            await user.deleteAccount();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Delete profile failed:', error);
            alert(error.message || 'Failed to delete profile. Please try again.');
            deleteProfileBtn.disabled = false;
            deleteProfileBtn.textContent = originalText;
        }
    });
}

if (postForm) {
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = e.currentTarget.querySelector('button[type="submit"], button');
        const originalText = submitBtn ? submitBtn.textContent : 'Publish';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing...';
        }

        try {
            const post = new Post();
            post.post_content = postContentEl.value;
            post.username = currentUserData ? currentUserData.username : usernameEl.innerText;
            await post.create();

            postContentEl.value = '';
            await loadPosts();
        } catch (error) {
            console.error('Publishing failed:', error);
            alert(error.message || 'Publishing failed. Please try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

if (allPostsWrapper) {
    allPostsWrapper.addEventListener('click', async (e) => {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl || actionEl.disabled) {
            return;
        }

        const postId = actionEl.getAttribute('data-post-id');
        if (!postId) {
            return;
        }

        if (actionEl.getAttribute('data-action') === 'like') {
            const originalText = actionEl.textContent;
            actionEl.disabled = true;
            actionEl.textContent = 'Updating...';

            try {
                const post = new Post();
                await post.toggleLike(postId, session_id);
                await loadPosts();
            } catch (error) {
                console.error('Liking failed:', error);
                alert(error.message || 'Like update failed. Please try again.');
                actionEl.disabled = false;
                actionEl.textContent = originalText;
            }
        }

        if (actionEl.getAttribute('data-action') === 'delete') {
            const confirmed = window.confirm('Delete this post?');
            if (!confirmed) {
                return;
            }

            actionEl.disabled = true;
            actionEl.textContent = 'Deleting...';

            try {
                const post = new Post();
                await post.remove(postId);
                await loadPosts();
            } catch (error) {
                console.error('Deleting post failed:', error);
                alert(error.message || 'Delete failed. Please try again.');
                actionEl.disabled = false;
                actionEl.textContent = 'Delete';
            }
        }
    });
}

populateUserData()
    .then(() => loadPosts())
    .catch((error) => {
        console.error('Initial loading failed:', error);
        alert('Failed to load profile data.');
    });
