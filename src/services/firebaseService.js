import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  getDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Image Compression Function
export const compressImageToBase64 = async (file, maxSizeKB = 800) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        let width = img.width
        let height = img.height
        const maxDim = 1200
        
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width
          width = maxDim
        } else if (height > maxDim) {
          width = (width * maxDim) / height
          height = maxDim
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        let quality = 0.8
        let dataUrl = canvas.toDataURL('image/jpeg', quality)
        
        const maxBytes = maxSizeKB * 1024 * 1.37
        
        while (dataUrl.length > maxBytes && quality > 0.1) {
          quality -= 0.05
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        
        if (dataUrl.length > maxBytes) {
          reject(new Error('Unable to compress image below size limit. Please use a smaller image.'))
        } else {
          console.log(`Image compressed: ${(dataUrl.length / 1024).toFixed(2)}KB at quality ${quality.toFixed(2)}`)
          resolve(dataUrl)
        }
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// User Functions
export const addUser = async (userData) => {
  try {
    const userRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return userRef.id
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

export const getUserByEmail = async (email) => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      return {
        id: userDoc.id,
        ...userDoc.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

export const getUserByUid = async (uid) => {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', uid))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      return {
        id: userDoc.id,
        ...userDoc.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user by UID:', error)
    throw error
  }
}

export const updateUser = async (userId, updateData) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const getAllUsers = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting all users:', error)
    throw error
  }
}

export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId))
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Blog Functions
export const addBlog = async (blogData) => {
  try {
    const blogRef = await addDoc(collection(db, 'blogs'), {
      ...blogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      likes: 0,
      likedBy: [], // Track who liked the blog
      viewedBy: [] // Track who viewed the blog
    })
    return blogRef.id
  } catch (error) {
    console.error('Error adding blog:', error)
    throw error
  }
}

export const getBlogs = async () => {
  try {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting blogs:', error)
    throw error
  }
}

export const getPublishedBlogs = async () => {
  try {
    const q = query(
      collection(db, 'blogs'), 
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting published blogs:', error)
    throw error
  }
}

export const updateBlog = async (blogId, updateData) => {
  try {
    const blogRef = doc(db, 'blogs', blogId)
    await updateDoc(blogRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating blog:', error)
    throw error
  }
}

// FIXED: Toggle like with proper tracking
export const toggleBlogLike = async (blogId, userId) => {
  try {
    const blogRef = doc(db, 'blogs', blogId)
    const blogSnap = await getDoc(blogRef)
    
    if (!blogSnap.exists()) {
      throw new Error('Blog not found')
    }
    
    const blogData = blogSnap.data()
    const likedBy = blogData.likedBy || []
    const isLiked = likedBy.includes(userId)
    
    if (isLiked) {
      // Unlike
      await updateDoc(blogRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
        updatedAt: serverTimestamp()
      })
      return false
    } else {
      // Like
      await updateDoc(blogRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
        updatedAt: serverTimestamp()
      })
      return true
    }
  } catch (error) {
    console.error('Error toggling blog like:', error)
    throw error
  }
}

// FIXED: Track view only once per user
export const incrementBlogView = async (blogId, userId) => {
  try {
    const blogRef = doc(db, 'blogs', blogId)
    const blogSnap = await getDoc(blogRef)
    
    if (!blogSnap.exists()) {
      throw new Error('Blog not found')
    }
    
    const blogData = blogSnap.data()
    const viewedBy = blogData.viewedBy || []
    
    // Only increment if user hasn't viewed before
    if (!viewedBy.includes(userId)) {
      await updateDoc(blogRef, {
        views: increment(1),
        viewedBy: arrayUnion(userId),
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error incrementing blog view:', error)
    throw error
  }
}

export const deleteBlog = async (blogId) => {
  try {
    // Delete all comments associated with this blog
    const commentsRef = collection(db, 'comments')
    const q = query(commentsRef, where('blogId', '==', blogId))
    const querySnapshot = await getDocs(q)
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    // Delete the blog
    await deleteDoc(doc(db, 'blogs', blogId))
  } catch (error) {
    console.error('Error deleting blog:', error)
    throw error
  }
}

// ===== GLOBAL COMMENT SYSTEM =====

// Add a comment to a blog
export const addComment = async (blogId, commentData) => {
  try {
    const commentRef = await addDoc(collection(db, 'comments'), {
      blogId,
      ...commentData,
      likes: 0,
      likedBy: [],
      replies: [], // Store reply IDs
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return commentRef.id
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

// Get all comments for a blog
export const getCommentsByBlogId = async (blogId) => {
  try {
    const q = query(
      collection(db, 'comments'), 
      where('blogId', '==', blogId),
      where('parentId', '==', null), // Only get top-level comments
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    const comments = []
    for (const docSnap of querySnapshot.docs) {
      const commentData = {
        id: docSnap.id,
        ...docSnap.data()
      }
      
      // Get replies for this comment
      commentData.replies = await getRepliesByCommentId(docSnap.id)
      comments.push(commentData)
    }
    
    return comments
  } catch (error) {
    console.error('Error getting comments:', error)
    throw error
  }
}

// Get replies for a comment
export const getRepliesByCommentId = async (commentId) => {
  try {
    const q = query(
      collection(db, 'comments'), 
      where('parentId', '==', commentId),
      orderBy('createdAt', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting replies:', error)
    throw error
  }
}

// Add a reply to a comment
export const addReply = async (blogId, parentCommentId, replyData) => {
  try {
    const replyRef = await addDoc(collection(db, 'comments'), {
      blogId,
      parentId: parentCommentId,
      ...replyData,
      likes: 0,
      likedBy: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return replyRef.id
  } catch (error) {
    console.error('Error adding reply:', error)
    throw error
  }
}

// Toggle like on a comment
export const toggleCommentLike = async (commentId, userId) => {
  try {
    const commentRef = doc(db, 'comments', commentId)
    const commentSnap = await getDoc(commentRef)
    
    if (!commentSnap.exists()) {
      throw new Error('Comment not found')
    }
    
    const commentData = commentSnap.data()
    const likedBy = commentData.likedBy || []
    const isLiked = likedBy.includes(userId)
    
    if (isLiked) {
      await updateDoc(commentRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
        updatedAt: serverTimestamp()
      })
      return false
    } else {
      await updateDoc(commentRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
        updatedAt: serverTimestamp()
      })
      return true
    }
  } catch (error) {
    console.error('Error toggling comment like:', error)
    throw error
  }
}

// Delete a comment (and all its replies)
export const deleteComment = async (commentId) => {
  try {
    // Delete all replies first
    const repliesQuery = query(
      collection(db, 'comments'),
      where('parentId', '==', commentId)
    )
    const repliesSnapshot = await getDocs(repliesQuery)
    const deletePromises = repliesSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    // Delete the comment itself
    await deleteDoc(doc(db, 'comments', commentId))
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}

// Update a comment
export const updateComment = async (commentId, text) => {
  try {
    const commentRef = doc(db, 'comments', commentId)
    await updateDoc(commentRef, {
      text,
      edited: true,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    throw error
  }
}

// ===== REST OF THE EXISTING FUNCTIONS =====

// Project Functions
export const addProject = async (projectData) => {
  try {
    const projectRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return projectRef.id
  } catch (error) {
    console.error('Error adding project:', error)
    throw error
  }
}

export const getProjects = async () => {
  try {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting projects:', error)
    throw error
  }
}

export const getPublishedProjects = async () => {
  try {
    const q = query(
      collection(db, 'projects'), 
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting published projects:', error)
    throw error
  }
}

export const getProjectById = async (projectId) => {
  try {
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await getDoc(projectRef)
    
    if (projectSnap.exists()) {
      return {
        id: projectSnap.id,
        ...projectSnap.data()
      }
    } else {
      throw new Error('Project not found')
    }
  } catch (error) {
    console.error('Error getting project:', error)
    throw error
  }
}

export const updateProject = async (projectId, updateData) => {
  try {
    const projectRef = doc(db, 'projects', projectId)
    await updateDoc(projectRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId))
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

// Service Booking Functions (continued...)
export const addServiceBooking = async (bookingData) => {
  try {
    const bookingRef = await addDoc(collection(db, 'service_bookings'), {
      ...bookingData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      priority: bookingData.urgency || 'normal',
      adminNotes: '',
      estimatedCompletion: null,
      actualCompletion: null
    })
    return bookingRef.id
  } catch (error) {
    console.error('Error adding service booking:', error)
    throw error
  }
}

export const getServiceBookings = async (userUid = null) => {
  try {
    let q
    if (userUid) {
      q = query(
        collection(db, 'service_bookings'), 
        where('userId', '==', userUid),
        orderBy('createdAt', 'desc')
      )
    } else {
      q = query(collection(db, 'service_bookings'), orderBy('createdAt', 'desc'))
    }
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting service bookings:', error)
    throw error
  }
}

export const getServiceBookingsByStatus = async (status, userUid = null) => {
  try {
    let q
    if (userUid) {
      q = query(
        collection(db, 'service_bookings'), 
        where('status', '==', status),
        where('userId', '==', userUid),
        orderBy('createdAt', 'desc')
      )
    } else {
      q = query(
        collection(db, 'service_bookings'), 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      )
    }
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting service bookings by status:', error)
    throw error
  }
}

export const updateServiceBooking = async (bookingId, updateData) => {
  try {
    const bookingRef = doc(db, 'service_bookings', bookingId)
    await updateDoc(bookingRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating service booking:', error)
    throw error
  }
}

export const updateBookingStatus = async (bookingId, status, adminNotes = '') => {
  try {
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    }
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }
    
    if (status === 'completed') {
      updateData.actualCompletion = serverTimestamp()
    }
    
    const bookingRef = doc(db, 'service_bookings', bookingId)
    await updateDoc(bookingRef, updateData)
  } catch (error) {
    console.error('Error updating booking status:', error)
    throw error
  }
}

export const deleteServiceBooking = async (bookingId) => {
  try {
    await deleteDoc(doc(db, 'service_bookings', bookingId))
  } catch (error) {
    console.error('Error deleting service booking:', error)
    throw error
  }
}

export const getServiceBookingById = async (bookingId) => {
  try {
    const bookingRef = doc(db, 'service_bookings', bookingId)
    const bookingSnap = await getDoc(bookingRef)
    
    if (bookingSnap.exists()) {
      return {
        id: bookingSnap.id,
        ...bookingSnap.data()
      }
    } else {
      throw new Error('Service booking not found')
    }
  } catch (error) {
    console.error('Error getting service booking:', error)
    throw error
  }
}

// Contact/Message Functions
export const addContactMessage = async (messageData) => {
  try {
    const messageRef = await addDoc(collection(db, 'contact_messages'), {
      ...messageData,
      status: 'unread',
      createdAt: serverTimestamp()
    })
    return messageRef.id
  } catch (error) {
    console.error('Error adding contact message:', error)
    throw error
  }
}

export const getContactMessages = async () => {
  try {
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting contact messages:', error)
    throw error
  }
}

export const updateContactMessageStatus = async (messageId, status) => {
  try {
    const messageRef = doc(db, 'contact_messages', messageId)
    await updateDoc(messageRef, {
      status,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating message status:', error)
    throw error
  }
}

// Analytics Functions
export const getAnalytics = async () => {
  try {
    const [blogs, projects, bookings, messages, users] = await Promise.all([
      getBlogs(),
      getProjects(),
      getServiceBookings(),
      getContactMessages(),
      getAllUsers()
    ])

    return {
      users: {
        total: users.length,
        active: users.filter(u => u.isActive !== false).length,
        googleUsers: users.filter(u => u.provider === 'google').length,
        emailUsers: users.filter(u => u.provider === 'email').length
      },
      blogs: {
        total: blogs.length,
        published: blogs.filter(b => b.published).length,
        drafts: blogs.filter(b => !b.published).length
      },
      projects: {
        total: projects.length,
        published: projects.filter(p => p.published).length,
        drafts: projects.filter(p => !p.published).length
      },
      bookings: {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        inProgress: bookings.filter(b => b.status === 'in-progress').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      },
      messages: {
        total: messages.length,
        unread: messages.filter(m => m.status === 'unread').length,
        read: messages.filter(m => m.status === 'read').length
      }
    }
  } catch (error) {
    console.error('Error getting analytics:', error)
    throw error
  }
}