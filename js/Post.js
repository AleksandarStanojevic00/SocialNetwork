class Post {
    post_id = '';
    post_content = '';
    user_id = '';
    username = '';
    likes = 0;
    created_at = '';
    liked_by = [];
    api_url = 'https://69c6b197f272266f3eacfe99.mockapi.io';

    normalizeLikedBy(rawValue) {
        if (Array.isArray(rawValue)) {
            return rawValue.map(value => String(value));
        }

        if (typeof rawValue === 'string' && rawValue.trim() !== '') {
            return rawValue.split(',').map(value => value.trim()).filter(Boolean);
        }

        return [];
    }

    async create() {
        const session = new Session();
        const session_id = session.getSession();

        if (!session_id) {
            throw new Error('Session expired. Please login again.');
        }

        const content = this.post_content.trim();
        if (!content) {
            throw new Error('Post content cannot be empty.');
        }

        const payload = JSON.stringify({
            user_id: session_id,
            username: this.username || 'Unknown user',
            content,
            likes: 0,
            liked_by: [],
            created_at: new Date().toISOString()
        });

        const response = await fetch(this.api_url + '/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        });

        if (!response.ok) {
            throw new Error(`Failed to create post. Status: ${response.status}`);
        }

        return response.json();
    }

    async getAll() {
        const response = await fetch(this.api_url + '/posts');
        if (!response.ok) {
            throw new Error(`Failed to fetch posts. Status: ${response.status}`);
        }

        const posts = await response.json();
        return posts.sort((a, b) => {
            const aDate = new Date(a.created_at || 0).getTime();
            const bDate = new Date(b.created_at || 0).getTime();
            return bDate - aDate;
        });
    }

    async remove(postId) {
        const response = await fetch(this.api_url + '/posts/' + postId, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete post. Status: ${response.status}`);
        }

        return true;
    }

    async toggleLike(postId, likerUserId) {
        if (!likerUserId) {
            throw new Error('Session expired. Please login again.');
        }

        const currentResponse = await fetch(this.api_url + '/posts/' + postId);
        if (!currentResponse.ok) {
            throw new Error(`Failed to load post. Status: ${currentResponse.status}`);
        }

        const currentPost = await currentResponse.json();
        const likedBy = this.normalizeLikedBy(currentPost.liked_by);
        const likerId = String(likerUserId);
        const userAlreadyLiked = likedBy.includes(likerId);

        const nextLikedBy = userAlreadyLiked
            ? likedBy.filter(id => id !== likerId)
            : [...likedBy, likerId];

        const baseLikes = Number(currentPost.likes || likedBy.length || 0);
        const nextLikes = userAlreadyLiked
            ? Math.max(baseLikes - 1, 0)
            : baseLikes + 1;

        const payload = JSON.stringify({
            user_id: currentPost.user_id,
            username: currentPost.username || 'Unknown user',
            content: currentPost.content || '',
            likes: nextLikes,
            liked_by: nextLikedBy,
            created_at: currentPost.created_at || new Date().toISOString()
        });

        const updateResponse = await fetch(this.api_url + '/posts/' + postId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update likes. Status: ${updateResponse.status}`);
        }

        return updateResponse.json();
    }
}
