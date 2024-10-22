import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', published_year: '', description: '', link: '' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase.from('books').select('*');
    setLoading(false);
    if (error) console.error('Error fetching books:', error);
    else setBooks(data);
  }

  async function addBook() {
    if (!newBook.title || !newBook.author || !newBook.published_year || !newBook.description || !newBook.link) {
      alert("Please fill in all fields.");
      return;
    }

    const { data, error } = await supabase.from('books').insert([newBook]);
    if (error) {
      console.error('Error adding book:', error);
      alert("Error adding book: " + error.message);
    } else if (data && data.length > 0) {
      setBooks([...books, data[0]]);
      setNewBook({ title: '', author: '', published_year: '', description: '', link: '' });
    }
  }

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <header className="bg-gray-800 p-5 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <h1 className="text-white text-3xl font-bold" style={{ fontFamily: 'Didot' }}>Books</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
            <h2 className="text-2xl font-semibold text-white mb-4">Add New Book</h2>
            <input
              type="text"
              placeholder="Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="border border-gray-600 p-2 rounded mb-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
              className="border border-gray-600 p-2 rounded mb-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <input
              type="number"
              placeholder="Published Year"
              value={newBook.published_year}
              onChange={(e) => setNewBook({ ...newBook, published_year: parseInt(e.target.value) })}
              className="border border-gray-600 p-2 rounded mb-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <textarea
              placeholder="Description"
              value={newBook.description}
              onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
              className="border border-gray-600 p-2 rounded mb-2 w-full bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            ></textarea>
            <input
              type="text"
              placeholder="Link"
              value={newBook.link}
              onChange={(e) => setNewBook({ ...newBook, link: e.target.value })}
              className="border border-gray-600 p-2 rounded mb-4 w-full bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <button onClick={addBook} className="bg-red-600 text-white p-2 rounded w-full hover:bg-red-500 transition duration-300">Add Book</button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
            <h2 className="text-2xl font-semibold text-white mb-4">Total Books</h2>
            <p className="text-3xl text-gray-300">{books.length}</p>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-600 p-2 rounded w-full bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
          />
        </div>

        <h1 className="text-3xl font-bold mb-4 text-white">Books Library</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left text-gray-300">Title</th>
                <th className="py-3 px-4 text-left text-gray-300">Author</th>
                <th className="py-3 px-4 text-left text-gray-300">Published Year</th>
                <th className="py-3 px-4 text-left text-gray-300">Description</th>
                <th className="py-3 px-4 text-left text-gray-300">Link</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-300">Loading...</td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b border-gray-600 hover:bg-gray-800 transition duration-200">
                    <td className="py-3 px-4 text-gray-300">{book.title}</td>
                    <td className="py-3 px-4 text-gray-300">{book.author}</td>
                    <td className="py-3 px-4 text-gray-300">{book.published_year}</td>
                    <td className="py-3 px-4 text-gray-300">{book.description}</td>
                    <td className="py-3 px-4 text-blue-400 hover:underline">
                      <a href={book.link} target="_blank" rel="noopener noreferrer">View</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Purpose Section */}
        <section className="bg-gray-800 p-6 mt-10 rounded-lg shadow-md text-gray-300">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Didot, serif' }}>
            Why This Website Is a Must for Book Lovers!
          </h2>
          <p className="text-gray-300 italic" style={{ fontFamily: 'Georgia, serif' }}>
            "I created this website to help fellow book lovers easily organize their collections, discover new reads, and share insights, all while enhancing my web development skills!"
          </p>
        </div>


        </section>

        {/* Copyright Notice */}
        <footer className="bg-gray-800 text-center py-4 mt-10">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} Books. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
}