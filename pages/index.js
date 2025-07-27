// pages/index.js
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Book, Plus, Search, AlertCircle, ExternalLink, BookOpen } from 'lucide-react';

function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.from('books').select('*');
      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addBook = useCallback(async (bookData) => {
    setError(null);
    try {
      const { data: existing, error: existingError } = await supabase
        .from('books')
        .select('*')
        .match({
          title: bookData.title,
          author: bookData.author,
          published_year: bookData.published_year,
        });

      if (existingError) throw new Error('Error checking for existing book');
      if (existing && existing.length > 0) {
        throw new Error('This book already exists in the database');
      }

      const { data, error } = await supabase.from('books').insert([bookData]).select();
      if (error) throw error;

      if (data && data.length > 0) {
        setBooks(prev => [...prev, data[0]]);
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  return { books, loading, error, fetchBooks, addBook, setError };
}

function BookForm({ onAddBook, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    published_year: '',
    link: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'published_year' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.published_year || !formData.link) {
      alert('All fields are required');
      return;
    }
    setIsSubmitting(true);
    const result = await onAddBook(formData);
    if (result.success) {
      setFormData({ title: '', author: '', published_year: '', link: '' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-900 p-6 border border-gray-800 rounded-lg shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-semibold text-white">Add New Book</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="title"
          placeholder="Book Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 bg-black border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isSubmitting || loading}
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={formData.author}
          onChange={handleChange}
          className="w-full p-3 bg-black border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isSubmitting || loading}
        />
        <input
          type="number"
          name="published_year"
          placeholder="Published Year"
          value={formData.published_year}
          onChange={handleChange}
          className="w-full p-3 bg-black border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isSubmitting || loading}
          min="1000"
          max={new Date().getFullYear()}
        />
        <input
          type="url"
          name="link"
          placeholder="Book Link (https://...)"
          value={formData.link}
          onChange={handleChange}
          className="w-full p-3 bg-black border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isSubmitting || loading}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-3 rounded-md transition-colors duration-200 disabled:bg-indigo-400"
        disabled={isSubmitting || loading}
      >
        {isSubmitting ? 'Adding...' : 'Add Book'}
      </button>
    </div>
  );
}

export default function Home() {
  const { books, loading, error, fetchBooks, addBook, setError } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* <div className="flex items-center gap-4">
              <img
                  src="/logo-transparent1-png.png"
                  alt="readpalm logo"
                  className="w-16 sm:w-20 md:w-24 lg:w-32 object-contain"
                />
                </div> */}
              {/* <h1 className="text-3xl font-bold">READPALM</h1> */}
              <div className="flex items-center gap-3">
                <Book className="w-8 h-8 text-indigo-400" />
                <h1 className="text-2xl font-bold">readPalm</h1>
              </div>
            
            <div className="flex items-center gap-2 bg-indigo-900 px-3 py-1 rounded-full">
              <BookOpen className="w-4 h-4 text-indigo-300" />
              <span className="text-sm font-medium">{books.length} Books</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-800 border border-red-600 text-red-100 p-4 mb-6 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
              <button className="text-red-300 hover:text-red-100 font-bold" onClick={() => setError(null)}>×</button>
            </div>
          </div>
        )}

        <BookForm onAddBook={addBook} loading={loading} />

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-700 bg-gray-900 text-white rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white text-gray-900 border border-gray-200 rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-700">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                <span>Loading books...</span>
              </div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="p-8 text-center">
              <Book className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">
                {searchQuery ? 'No books found' : 'No books yet'}
              </h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try different search terms' : 'Add your first book to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{book.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{book.published_year}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={book.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} Book Library. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
