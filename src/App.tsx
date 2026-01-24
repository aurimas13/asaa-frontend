import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { ProductDetail } from './pages/ProductDetail'
import { Makers } from './pages/Makers'
import { MakerDetail } from './pages/MakerDetail'
import { Events } from './pages/Events'
import { Categories } from './pages/Categories'
import { Cart } from './pages/Cart'
import { Wishlist } from './pages/Wishlist'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { Profile } from './pages/Profile'
import { Orders } from './pages/Orders'
import { OrderDetail } from './pages/OrderDetail'
import { OrderConfirmation } from './pages/OrderConfirmation'
import { Search } from './pages/Search'
import { Contact } from './pages/Contact'
import { BecomeMaker } from './pages/BecomeMaker'
import { Help } from './pages/Help'
import { Shipping } from './pages/Shipping'
import { Returns } from './pages/Returns'
import { MakerResources } from './pages/MakerResources'
import { MakerGuidelines } from './pages/MakerGuidelines'
import { SuccessStories } from './pages/SuccessStories'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { CookieConsent } from './components/CookieConsent'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/makers" element={<Makers />} />
            <Route path="/maker/:id" element={<MakerDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/search" element={<Search />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/become-maker" element={<BecomeMaker />} />
            <Route path="/help" element={<Help />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/maker-resources" element={<MakerResources />} />
            <Route path="/maker-guidelines" element={<MakerGuidelines />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </Layout>
        <CookieConsent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
