import { Link } from 'react-router-dom';
import { HiLocationMarker, HiMail, HiPhone } from 'react-icons/hi';

const Footer = () => (
  <footer className="bg-brand-surface border-t border-brand-border mt-auto">
    <div className="page-container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-sm">AD</span>
            </div>
            <span className="font-display font-bold text-xl text-white">Aapki Dukaan</span>
          </div>
          <p className="text-brand-muted font-body text-sm leading-relaxed max-w-xs">
            Discover local shops around you, order products, and get them delivered fast — all in one place.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {['twitter','instagram','facebook'].map((s) => (
              <a key={s} href="#"
                className="w-8 h-8 rounded-lg bg-brand-card hover:bg-primary-500/20 border border-brand-border hover:border-primary-500/40 flex items-center justify-center transition-all text-brand-muted hover:text-primary-400">
                <span className="text-xs capitalize">{s.charAt(0).toUpperCase()}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-display font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Browse Shops', to: '/shops' },
              { label: 'My Orders',   to: '/orders' },
              { label: 'My Profile',  to: '/profile' },
              { label: 'Cart',        to: '/cart' },
            ].map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-brand-muted hover:text-primary-400 font-body transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2 text-sm text-brand-muted font-body">
              <HiLocationMarker className="w-4 h-4 text-primary-400 flex-shrink-0" />
              Noida, India
            </li>
            <li className="flex items-center gap-2 text-sm text-brand-muted font-body">
              <HiMail className="w-4 h-4 text-primary-400 flex-shrink-0" />
              support@Aapkidukaan.in
            </li>
            <li className="flex items-center gap-2 text-sm text-brand-muted font-body">
              <HiPhone className="w-4 h-4 text-primary-400 flex-shrink-0" />
              +91 99999 00000
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-brand-muted font-body">
          © {new Date().getFullYear()} ShopNear. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-brand-muted font-body">
          <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
