import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ensure this is correctly configured

export default function Home() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    published_year: '',
    description: '',
    link: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch books from Supabase on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Function to fetch books from the database
  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase.from('books').select('*');
    setLoading(false);

    if (error) {
      console.error('Error fetching books:', error);
      alert('There was an issue fetching the book data. Please try again.');
    } else {
      setBooks(data);
    }
  }
// Function to add a new book to the database
async function addBook() {
  if (!newBook.title || !newBook.author || !newBook.published_year || !newBook.description || !newBook.link) {
    alert("Please fill in all fields.");
    return;
  }

  // Check if the book already exists in the database
  const { data: existingBooks, error: fetchError } = await supabase
    .from('books')
    .select('*')
    .eq('title', newBook.title)
    .eq('author', newBook.author)
    .eq('published_year', newBook.published_year);

  if (fetchError) {
    console.error('Error checking for existing book:', fetchError);
    alert("Error checking for existing book: " + fetchError.message);
    return;
  }

  if (existingBooks && existingBooks.length > 0) {
    alert("This book already exists in the database.");
    return;
  }

  // Insert the new book if it doesn't already exist
  const { data, error } = await supabase.from('books').insert([newBook]);

  if (error) {
    console.error('Error adding book:', error);
    alert("Error adding book: " + error.message);
  } else if (data && data.length > 0) {
    setBooks([...books, data[0]]); // Append the new book to the list
    setNewBook({ title: '', author: '', published_year: '', description: '', link: '' }); // Reset form
  }
}


  // Filter books based on search query
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white p-5 border-b">
        <img src="/logo-transparent-svg.svg" alt="Logo" className="h-12" />
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Add New Book Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Add New Book</h2>

            <input
              type="text"
              placeholder="Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="border p-2 rounded mb-2 w-full"
            />

            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
              className="border p-2 rounded mb-2 w-full"
            />

            <input
              type="number"
              placeholder="Published Year"
              value={newBook.published_year}
              onChange={(e) => setNewBook({ ...newBook, published_year: parseInt(e.target.value) })}
              className="border p-2 rounded mb-2 w-full"
            />

            <textarea
              placeholder="Description"
              value={newBook.description}
              onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
              className="border p-2 rounded mb-2 w-full"
            ></textarea>

            <input
              type="text"
              placeholder="Link"
              value={newBook.link}
              onChange={(e) => setNewBook({ ...newBook, link: e.target.value })}
              className="border p-2 rounded mb-4 w-full"
            />

            <button onClick={addBook} className="bg-blue-600 text-white p-2 rounded w-full">
              Add Book
            </button>
          </div>

          {/* Display Total Books */}
          <div className="bg-white p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Total Books</h2>
            <p className="text-3xl">{books.length}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Books Library */}
        <h1 className="text-3xl font-bold mb-4">Books Library</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Author</th>
                <th className="py-3 px-4 text-left">Published Year</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Link</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">Loading...</td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b">
                    <td className="py-3 px-4">{book.title}</td>
                    <td className="py-3 px-4">{book.author}</td>
                    <td className="py-3 px-4">{book.published_year}</td>
                    <td className="py-3 px-4">{book.description}</td>
                    <td className="py-3 px-4 text-blue-600">
                      <a href={book.link} target="_blank" rel="noopener noreferrer">View</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Purpose Section */}
        <section className="bg-gray-100 p-6 mt-10 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Why This Website Is a Must for Book Lovers!</h2>
          <p className="italic">
            "I created this website to help fellow book lovers easily organize their collections, discover new reads, and share insights!"
          </p>
        </section>

        {/* Copyright Notice */}
        <footer className="text-center py-4 mt-10">
          <p>&copy; {new Date().getFullYear()} Books. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
