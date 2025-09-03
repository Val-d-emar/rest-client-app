export default function Home() {
  return (
    <div className="container">
      <header>
        <h1>H1 REST Client App</h1>
        <h1>H1 Клиент App</h1>
      </header>
      <main>
        <br />
        <h2>H2 Client for working with REST API</h2>
        <h2>H2 Клиент для работы с REST API</h2>
        <br />
        <button>Click me</button>
        <br />
        <a href="http://example.com">Link</a>
        <a href="http://example.com">Link2</a>
        <input type="text" placeholder="Enter text" />
        <br />
        <select>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
        <br />

        <div className="image-container">
          <img src="/back-picture.jpg" alt="back-picture.jpg" style={{ objectFit: 'cover' }} />
        </div>

        <p>This is an example paragraph.</p>
        <p>Это пример параграфа</p>
        <p className="error">This is an example Error.</p>
        <div className="card">
          <h3>H3 Card Title</h3>
          <h3>H3 Название карточки</h3>
          <p>Card content. Box-shadow и скругление.</p>
        </div>
        <div className="modal">
          <h3>Modal Title</h3>
          <p>Modal content. Box-shadow и скругление.</p>
        </div>
        <button disabled>Disabled Button</button>
      </main>
      <footer>
        <p>Footer content goes here.</p>
      </footer>
    </div>
  );
}
