# Sunday Tasks - January 25, 2026

## 🌅 MORNING SESSION (9:00-12:00 EET)

### Task 1: Add Sample Lithuanian Craftsmen Data (1.5 hours)

**Step 1:** Create Test Maker Accounts
1. Open your deployed site (or localhost)
2. Go to /signup
3. Create 5-10 test accounts with these emails:
   ```
   deividas@pottery.lt
   lina@ceramics.lt
   virginija@weaving.lt
   kazys@basketry.lt
   rasa@sashes.lt
   ```
4. Use password: `TestMaker123!` for all (you'll change later)

**Step 2:** Get User IDs
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: Authentication > Users
3. Copy each user's UUID
4. Create a mapping document:
   ```
   deividas@pottery.lt -> [UUID-1]
   lina@ceramics.lt -> [UUID-2]
   etc.
   ```

**Step 3:** Insert Makers & Products
1. Open `/sample-data.sql`
2. Replace `REPLACE-WITH-USER-ID-X` with actual UUIDs
3. Run SQL in Supabase SQL Editor
4. Verify makers appear in database
5. Check products are linked correctly

**Step 4:** Add Product Images
- Use provided Pexels URLs, or
- Upload your own to Supabase Storage, or
- Use placeholder images for now

**Expected Output:**
- 5-10 active makers
- 20-30 products across categories
- All products visible on /products page

---

### Task 2: Complete i18n Integration (1 hour)

**Update Layout Component:**
```bash
# The Layout needs to use translation hooks
- Import useTranslation
- Replace hardcoded strings with t('key')
- Add LanguageSwitcher component
- Test language switching
```

**Update Home Page:**
```bash
# Home.tsx needs translations
- Hero section
- Feature cards
- Category names
- CTA buttons
```

**Test All Languages:**
1. Switch to Lithuanian - verify all text
2. Switch to English - check translations
3. Switch to French - verify French text
4. Check localStorage persistence
5. Test browser language detection

**Expected Output:**
- All pages support LT/EN/FR
- Language switcher works smoothly
- No English fallbacks visible

---

### Task 3: Deploy to Production (30 minutes)

**Connect to Vercel:**
1. Go to vercel.com
2. Import GitHub repository: `aurimas13/asaa-frontend`
3. Configure build settings (auto-detected)
4. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
   VITE_SUPABASE_SUPABASE_ANON_KEY=[your-key]
   ```
5. Deploy!

**Test Live Site:**
- Visit your-project.vercel.app
- Test signup/login
- Browse products
- Switch languages
- Add to cart
- Check mobile responsiveness

**Expected Output:**
- Live production URL
- SSL certificate active
- All features working
- Fast page loads (<2s)

---

## 🌞 AFTERNOON SESSION (13:00-17:00 EET)

### Task 4: Implement Search & Filtering (1.5 hours)

**Product Search:**
1. Create `SearchBar` component
2. Implement full-text search in products table
3. Search by:
   - Product title
   - Description
   - Materials
   - Maker name

**Filter System:**
1. Category filter (dropdown)
2. Price range (slider)
3. Location filter (by city)
4. Rating filter (stars)
5. "In Stock Only" checkbox

**Sort Options:**
1. Newest first
2. Price: Low to High
3. Price: High to Low
4. Most Popular (by rating)
5. Best Selling

**Expected Output:**
- Working search bar
- Filter sidebar on /products
- Real-time results
- URL parameters for filters
- "No results" state

---

### Task 5: Enhanced Maker Profiles (1 hour)

**Individual Maker Pages:**
1. Create `/maker/:id` route
2. Display:
   - Maker bio and description
   - Location and contact info
   - All products by this maker
   - Average rating
   - Total sales
   - Verification badge
3. "Follow" button functionality
4. "Contact Maker" button

**Maker Directory Improvements:**
1. Filter makers by:
   - Location (city/region)
   - Craft type
   - Verified only
2. Sort by:
   - Rating
   - Total sales
   - Newest

**Expected Output:**
- Beautiful maker profile pages
- Working follow system
- Contact functionality ready

---

### Task 6: Service Integrations (1.5 hours)

**Formspree Contact Form:**
1. Create `ContactForm` component
2. Add to /contact page
3. Fields:
   - Name
   - Email
   - Subject
   - Message
4. Submit to Formspree endpoint
5. Success/error handling
6. Lithuanian translations

**"Become a Maker" Application:**
1. Create application form
2. Fields:
   - Personal info
   - Business name
   - Craft type
   - Experience
   - Portfolio images
   - Motivation
3. Submit to Formspree
4. Auto-email notification

**ChatGPT Widget (Optional):**
If you provide OpenAI API key:
1. Add chat widget to bottom-right
2. Context about Lithuanian crafts
3. Product recommendations
4. FAQ responses

**Expected Output:**
- Working contact form
- Maker application form
- Email notifications sent

---

### Task 7: SEO & Performance (1 hour)

**SEO Optimization:**
1. Update meta tags on all pages
2. Add Open Graph tags
3. Create sitemap.xml
4. Add robots.txt
5. Structured data for products
6. Alt tags on all images

**Performance:**
1. Image optimization
2. Lazy loading
3. Code splitting
4. Bundle size analysis
5. Lighthouse score >90

**Analytics Setup:**
1. Add Google Analytics (if desired)
2. Track key events:
   - Product views
   - Add to cart
   - Purchases
   - Signup conversions

**Expected Output:**
- SEO score >90
- Fast page loads
- Social media previews working
- Analytics tracking

---

## 🌙 EVENING SESSION (18:00-20:00 EET)

### Task 8: Testing & Quality Assurance (1 hour)

**Test User Journeys:**
1. **Buyer Journey:**
   - Browse products
   - Search and filter
   - View product details
   - Add to cart
   - View cart
   - (Checkout - Week 1)

2. **Maker Journey:**
   - View maker profiles
   - Follow makers
   - Browse by maker
   - Contact maker

3. **Authentication:**
   - Sign up
   - Sign in
   - Sign out
   - Password validation
   - Profile update

**Mobile Testing:**
1. Test on iPhone (Safari)
2. Test on Android (Chrome)
3. Check tablet view
4. Test landscape mode
5. Touch interactions

**Browser Testing:**
1. Chrome (latest)
2. Firefox (latest)
3. Safari (latest)
4. Edge (latest)

**Expected Output:**
- Bug list documented
- Critical fixes applied
- Mobile UX smooth
- Cross-browser compatible

---

### Task 9: Documentation & Polish (1 hour)

**Update README:**
1. Installation instructions
2. Development setup
3. Environment variables
4. Deployment guide
5. Contributing guidelines
6. License

**Create User Guides:**
1. **For Buyers:**
   - How to browse
   - How to purchase
   - How to contact makers

2. **For Makers:**
   - How to apply
   - How to list products
   - How to manage shop
   - How to fulfill orders

**Investor Materials:**
1. One-page executive summary
2. Market opportunity
3. Competitive advantages
4. AI differentiation
5. Revenue model
6. Growth strategy

**Expected Output:**
- Comprehensive README
- User documentation
- Investor summary ready

---

## 📊 END OF DAY CHECKLIST

By 8:00 PM on Sunday, you should have:

- [ ] 5-10 Lithuanian makers in database
- [ ] 20-30 authentic products listed
- [ ] Full multilingual support (LT/EN/FR) working
- [ ] Deployed live on Vercel
- [ ] Search and filtering functional
- [ ] Enhanced maker profiles
- [ ] Contact forms operational
- [ ] SEO optimized
- [ ] Mobile responsive
- [ ] All features tested
- [ ] Documentation complete
- [ ] No critical bugs
- [ ] Performance score >85

---

## 🎯 SUCCESS METRICS

**Technical:**
- Build time: <10s
- Page load: <2s
- Lighthouse: >90
- Zero TypeScript errors
- 100% mobile responsive

**Content:**
- 5+ verified Lithuanian makers
- 20+ authentic craft products
- 3 languages fully supported
- All product categories populated

**User Experience:**
- Intuitive navigation
- Fast search results
- Smooth animations
- Clear CTAs
- Professional design

---

## 🚨 IF YOU GET STUCK

**Sample Data Issues:**
- Create users manually first
- Use Supabase Dashboard SQL Editor
- Check foreign key constraints
- Verify user IDs match

**Translation Issues:**
- Check i18n console logs
- Verify JSON syntax
- Test with browser language
- Clear localStorage

**Deployment Issues:**
- Check build logs
- Verify env variables
- Test locally first
- Check Vercel dashboard

---

## 📞 QUESTIONS TO ANSWER

Before starting tomorrow:

1. **Do you have these API keys ready?**
   - OpenAI API key (ChatGPT Business)
   - Formspree form endpoint

2. **Product images?**
   - Will you upload real photos?
   - Or use stock images for now?

3. **Domain name?**
   - craftsandhands.com?
   - crafts-and-hands.lt?
   - amataiirankos.lt?

4. **Priority craftsmen?**
   - Which 5-10 makers to add first?
   - Do you have their permission?
   - Any existing relationships?

---

## 💡 TIPS FOR SUCCESS

1. **Start Early:** Begin at 9:00 AM sharp
2. **Take Breaks:** 10 min every hour
3. **Test Frequently:** Don't wait until evening
4. **Document Issues:** Keep a bug list
5. **Commit Often:** Git commits every 30 min
6. **Ask Questions:** If stuck >15 min, ask for help
7. **Celebrate Wins:** Each completed task is progress!

---

**Tomorrow will be productive! You've got this!** 🚀

The foundation is solid. Now we fill it with authentic Lithuanian craftsmanship and prepare for launch.

**Geros sėkmės!** (Good luck!)
