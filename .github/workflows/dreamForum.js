export class DreamForum {
  constructor() {
    this.room = new WebsimSocket();
    this.setupElements();
    this.setupEventListeners();
    this.loadPosts();
  }

  setupElements() {
    this.forumSection = document.querySelector('.forum-section');
    this.postsContainer = document.querySelector('.forum-posts');
    this.newPostBtn = document.getElementById('newPostBtn');
    this.postModal = document.getElementById('newPostModal');
    this.closePostBtn = document.querySelector('.close-post');
    this.postForm = document.getElementById('dreamPostForm');
    this.tagFilter = document.querySelector('.tag-filter');
  }

  setupEventListeners() {
    this.newPostBtn.addEventListener('click', () => this.openPostModal());
    this.closePostBtn.addEventListener('click', () => this.closePostModal());
    if (this.postForm) {
      this.postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
    }
    
    // Add tag filtering functionality
    this.tagFilter.addEventListener('click', (e) => {
      if (e.target.classList.contains('forum-tag')) {
        e.target.classList.toggle('selected');
        this.filterPosts();
      }
    });

    // Subscribe to real-time updates
    this.room.collection('dreampost').subscribe(() => this.loadPosts());
    this.room.collection('comment').subscribe(() => this.loadPosts());

    // Add delegation for dynamic elements
    this.postsContainer?.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-btn');
      if (deleteBtn) {
        const postId = deleteBtn.dataset.postId;
        this.deletePost(postId);
      }
    });
  }

  async loadPosts() {
    const posts = await this.room.collection('dreampost').getList();
    const comments = await this.room.collection('comment').getList();
    
    // Group comments by post
    const commentsByPost = comments.reduce((acc, comment) => {
      if (!acc[comment.post_id]) acc[comment.post_id] = [];
      acc[comment.post_id].push(comment);
      return acc;
    }, {});

    if (!this.postsContainer) return;
    
    this.postsContainer.innerHTML = posts.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    ).map(post => this.renderPost(post, commentsByPost[post.id] || [])).join('');
  }

  renderPost(post, comments) {
    const isAuthor = post.username === this.room.party.client.username;
    return `
      <div class="post-entry" id="post-${post.id}">
        <div class="post-header">
          <div class="post-author">
            <img src="https://images.websim.ai/avatar/${post.username}" 
                 alt="${post.username}" 
                 class="author-avatar">
            <div>
              <strong>${post.username}</strong>
              <div class="post-meta">
                ${new Date(post.created_at).toLocaleString()}
              </div>
            </div>
          </div>
          ${isAuthor ? `
            <button class="delete-btn" data-post-id="${post.id}">
              <span class="delete-icon">×</span>
            </button>
          ` : ''}
        </div>
        
        <div class="post-content">
          <h3>${this.escapeHtml(post.title)}</h3>
          <p>${this.escapeHtml(post.content)}</p>
        </div>
        
        <div class="tag-list">
          ${post.tags.map(tag => 
            `<span class="forum-tag">#${this.escapeHtml(tag)}</span>`
          ).join('')}
        </div>
        
        <div class="post-footer">
          <div class="post-actions">
            <button class="post-action ${post.likes?.includes(this.room.party.client.username) ? 'liked' : ''}"
                    onclick="dreamForum.toggleLike('${post.id}')">
              ♥ ${post.likes?.length || 0}
            </button>
            <button class="post-action" 
                    onclick="dreamForum.toggleComments('${post.id}')">
              💬 ${comments.length}
            </button>
          </div>
        </div>
        
        <div class="comments-section" id="comments-${post.id}" style="display: none;">
          ${comments.map(comment => this.renderComment(comment)).join('')}
          
          <form class="comment-form" onsubmit="dreamForum.submitComment(event, '${post.id}')">
            <input type="text" 
                   class="comment-input" 
                   placeholder="Share your thoughts..."
                   required>
            <button type="submit" class="comment-submit">Post</button>
          </form>
        </div>
      </div>
    `;
  }

  renderComment(comment) {
    return `
      <div class="comment">
        <div class="comment-header">
          <div class="comment-author">
            <img src="https://images.websim.ai/avatar/${comment.username}" 
                 alt="${comment.username}" 
                 class="comment-avatar">
            <strong>${comment.username}</strong>
          </div>
          <span>${new Date(comment.created_at).toLocaleString()}</span>
        </div>
        <div class="comment-content">
          ${this.escapeHtml(comment.content)}
        </div>
      </div>
    `;
  }

  async deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        // Delete the post
        await this.room.collection('dreampost').delete(postId);
        
        // Delete all comments associated with the post
        const comments = await this.room.collection('comment')
          .filter({ post_id: postId })
          .getList();
          
        for (const comment of comments) {
          await this.room.collection('comment').delete(comment.id);
        }
        
        // Post will be removed automatically through the subscription
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  }

  async handlePostSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const tags = document.getElementById('postTags').value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    try {
      await this.room.collection('dreampost').create({
        title,
        content,
        tags,
        likes: []
      });
      
      this.closePostModal();
      this.postForm.reset();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }

  async toggleLike(postId) {
    const post = await this.room.collection('dreampost').find(postId);
    if (!post) return;

    const username = this.room.party.client.username;
    const likes = post.likes || [];
    const newLikes = likes.includes(username) 
      ? likes.filter(like => like !== username)
      : [...likes, username];

    try {
      await this.room.collection('dreampost').update(postId, { likes: newLikes });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  }

  async submitComment(event, postId) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('.comment-input');
    const content = input.value;

    try {
      await this.room.collection('comment').create({
        post_id: postId,
        content
      });
      
      input.value = '';
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  }

  toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
      commentsSection.style.display = 
        commentsSection.style.display === 'none' ? 'block' : 'none';
    }
  }

  openPostModal() {
    this.postModal.style.display = 'block';
  }

  closePostModal() {
    this.postModal.style.display = 'none';
    this.postForm.reset();
  }

  filterPosts() {
    const selectedTags = Array.from(document.querySelectorAll('.forum-tag.selected'))
      .map(tag => tag.textContent.slice(1)); // Remove # from tag
    
    const posts = document.querySelectorAll('.post-entry');
    posts.forEach(post => {
      const postTags = Array.from(post.querySelectorAll('.forum-tag'))
        .map(tag => tag.textContent.slice(1));
      
      const shouldShow = selectedTags.length === 0 || 
        selectedTags.some(tag => postTags.includes(tag));
      
      post.style.display = shouldShow ? 'block' : 'none';
    });
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

window.DreamForum = DreamForum;
const dreamForum = new DreamForum();
window.dreamForum = dreamForum;
