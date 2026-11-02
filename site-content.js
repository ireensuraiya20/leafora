(function () {
  'use strict';
  var defaults = {
    brandName: 'Leafora', brandAlt:'Leafora logo: a plant growing from a shopping bag inside a green ring. Plants, online and physical store.', footerTagline: 'Leafora | Plants, online & physical store',
    nav: { ariaLabel:'Main navigation', plants:'Plants', why:'Why Leafora', blog:'Blog', visit:'Visit', shopNow:'Shop now' },
    hero: { eyebrow:'Plants | Online & physical store', title:'Plants that settle in and keep growing.', description:'Leafora is a plant shop you can visit or order from online. Every plant comes healthy, with simple care notes so it does well in your home.', primaryLabel:'Shop plants', secondaryLabel:'Visit the store' },
    shop: { title:'Plants, pots and care', description:'Prices are in taka. Add what you want and send us the order.', filterLabel:'Filter plants' },
    productDetails: { detailsButton:'View details', usefulnessLabel:'Good to know', careLabel:'Care guide', closeButton:'Close details', addToOrder:'Add to cart', dialogLabel:'Product details' },
    filters: [
      { id:'all', label:'All' }, { id:'low', label:'Low light' }, { id:'bright', label:'Bright light' },
      { id:'flower', label:'Flowering' }, { id:'herb', label:'Herbs' }, { id:'care', label:'Pots & care' }
    ],
    tagLabels: { low:'Low light', bright:'Bright light', herb:'Herb', flower:'Flowering', care:'Pots & care' },
    why: { title:'Healthy plants, easy to look after', description:'We keep the shop small so each plant gets looked at before it goes home with you.', items:[
      { title:'Checked before they leave', text:'Every plant is looked over for yellow leaves, pests and loose soil before it is handed over or packed.' },
      { title:'A care card with each plant', text:'You get its light, water and repotting needs on one card, so you are not guessing in week two.' },
      { title:'Online or in the store', text:'Choose your plants here and send the order, or come in and pick them by hand. Pickup and local delivery both work.' }
    ] },
    store: { title:'Visit the store', description:'Come and see the plants in person.', address:'Your shop address, Bogura', hours:'Daily, 9:00 am to 8:00 pm', phone:'+880 1XXX-XXXXXX', whatsapp:'', facebook:'facebook.com/your-page', labels:{ address:'Address', hours:'Hours', phone:'Phone', facebook:'Facebook' } },
    order: { title:'Order online', description:'It takes a minute.', steps:[
      'Add plants to your cart using the Add to cart buttons.',
      'Open your cart to review quantities and the total, then continue to checkout.',
      'Enter your contact and delivery details, then confirm the prepared order in WhatsApp.',
      'We confirm stock, the delivery charge and a pickup time.'
    ], checkout:{button:'Confirm order', title:'Contact and delivery details', nameLabel:'Full name', phoneLabel:'Phone number', methodLabel:'Delivery method', deliveryOption:'Local delivery', pickupOption:'Store pickup', addressLabel:'Delivery address', noteLabel:'Order note (optional)', continueButton:'Continue to WhatsApp', sendButton:'Confirm order on WhatsApp', backButton:'Back to cart', readyMessage:'Your order is ready. Review it in WhatsApp, then tap Send to place the order.', noWhatsappMessage:'WhatsApp ordering is not set up yet. Please contact the store directly.'}, labels:{ addButton:'Add', cartButton:'Add to cart', viewCartButton:'View cart', cartTitle:'Your cart', emptyCart:'Your cart is empty.', continueShopping:'Continue shopping', removeButton:'Remove one', increaseButton:'Add one', quantityLabel:'Quantity of', fallbackLabel:'Your order message', copyButton:'Copy order', whatsappButton:'Send on WhatsApp', singular:'plant', plural:'plants', messageIntro:'Hello {shopName}, I would like to order:', totalLabel:'Total', copySuccess:'Order copied. Paste it in Messenger or WhatsApp.', copyFallback:'Copy this message and send it to us.' } },
    products: [
      {id:'money-plant',name:'Money plant',bn:'মানি প্লান্ট',kind:'hanging',tags:['low'],rows:[['Light','Low to medium light'],['Water','When the top soil feels dry']],usefulness:'Trailing stems soften shelves and hanging corners, making it an easy way to add greenery in a small space.',price:250,imageUrl:''},
      {id:'snake-plant',name:'Snake plant',bn:'স্নেক প্লান্ট',kind:'snake',tags:['low','bright'],rows:[['Light','Low to bright light'],['Water','Every 2 to 3 weeks']],usefulness:'Its upright leaves add height while taking up little floor space. A good pick if you prefer a simple watering routine.',price:450,imageUrl:''},
      {id:'peace-lily',name:'Peace lily',bn:'পিস লিলি',kind:'leafy',tags:['low'],rows:[['Light','Shade to medium light'],['Water','Weekly. Leaves droop when thirsty']],usefulness:'Broad green leaves and seasonal white blooms bring a calm, leafy look to a shaded room.',price:500,imageUrl:''},
      {id:'monstera',name:'Monstera',bn:'মনস্টেরা',kind:'monstera',tags:['bright'],rows:[['Light','Bright, indirect light'],['Water','Weekly. Let the top inch dry']],usefulness:'Large split leaves make it a striking floor plant for a bright corner or a spacious living room.',price:1200,imageUrl:''},
      {id:'boston-fern',name:'Boston fern',bn:'বস্টন ফার্ন',kind:'fern',tags:['low'],rows:[['Light','Shade to medium light'],['Water','Keep soil lightly moist']],usefulness:'Its fine, arching fronds add a soft, full texture to a shelf, porch, or hanging planter.',price:450,imageUrl:''},
      {id:'lucky-bamboo',name:'Lucky bamboo',bn:'লাকি বাম্বু',kind:'bamboo',tags:['low'],rows:[['Light','Low to medium light'],['Water','Change the vase water weekly']],usefulness:'A compact tabletop arrangement that grows in water, so you can enjoy greenery without a soil-filled pot.',price:400,imageUrl:''},
      {id:'spider-plant',name:'Spider plant',bn:'স্পাইডার প্লান্ট',kind:'grass',tags:['low','bright'],rows:[['Light','Medium, indirect light'],['Water','Weekly. Forgives a missed week']],usefulness:'Arching leaves look lively on a shelf or in a hanging pot; mature plants can grow small plantlets.',price:300,imageUrl:''},
      {id:'areca-palm',name:'Areca palm',bn:'এরেকা পাম',kind:'palm',tags:['bright'],rows:[['Light','Bright, indirect light'],['Water','Weekly. Keep soil lightly moist']],usefulness:'A tall, feathery plant that fills an empty bright corner with a tropical feel.',price:900,imageUrl:''},
      {id:'rubber-plant',name:'Rubber plant',bn:'রাবার প্লান্ট',kind:'rubber',tags:['bright'],rows:[['Light','Bright, indirect light'],['Water','Every 1 to 2 weeks']],usefulness:'Glossy, broad leaves give a room a bold green focal point without needing a cluster of smaller pots.',price:800,imageUrl:''},
      {id:'aloe-vera',name:'Aloe vera',bn:'ঘৃতকুমারী',kind:'aloe',tags:['bright'],rows:[['Light','Bright light, some direct sun'],['Water','Every 2 weeks. Let soil dry between']],usefulness:'A sculptural succulent for a sunny sill; its water-storing leaves suit people who prefer less frequent watering.',price:200,imageUrl:''},
      {id:'jade-plant',name:'Jade plant',bn:'জেড প্লান্ট',kind:'round',tags:['bright'],rows:[['Light','Bright light'],['Water','Every 2 to 3 weeks']],usefulness:'A compact succulent with rounded leaves that works well on a sunny desk or windowsill.',price:350,imageUrl:''},
      {id:'cactus',name:'Cactus',bn:'ক্যাকটাস',kind:'cactus',tags:['bright'],rows:[['Light','Full sun'],['Water','Every 3 weeks. Less in winter']],usefulness:'A small sculptural accent for a sunny spot, with a simple low-water care routine.',price:180,imageUrl:''},
      {id:'bonsai',name:'Ficus bonsai',bn:'বনসাই',kind:'bonsai',tags:['bright'],rows:[['Light','Bright, indirect light'],['Water','When the soil surface dries']],usefulness:'A miniature tree makes a distinctive tabletop display and is rewarding for anyone who enjoys careful shaping.',price:1800,imageUrl:''},
      {id:'rose',name:'Potted rose',bn:'গোলাপ',kind:'rose',tags:['bright','flower'],rows:[['Light','Full sun, 5 to 6 hours'],['Water','Every 2 days in summer']],usefulness:'Enjoy colourful blooms on a sunny balcony or patio; regular light and watering help support flowering.',price:350,imageUrl:''},
      {id:'marigold',name:'Marigold',bn:'গাঁদা',kind:'marigold',tags:['bright','flower'],rows:[['Light','Full sun'],['Water','Every 2 days. Do not wet the flowers']],usefulness:'A cheerful flowering choice for sunny balconies, window boxes, and seasonal garden colour.',price:80,imageUrl:''},
      {id:'orchid',name:'Orchid',bn:'অর্কিড',kind:'orchid',tags:['bright','flower'],rows:[['Light','Bright, indirect light'],['Water','Once a week, drain well']],usefulness:'Elegant blooms make a long-lasting display piece for a bright room with filtered light.',price:1500,imageUrl:''},
      {id:'tulsi',name:'Tulsi',bn:'তুলসী',kind:'herb',tags:['bright','herb'],rows:[['Light','Full sun, 5 to 6 hours'],['Water','A little each day. Never soggy']],usefulness:'A fragrant herb for a sunny kitchen garden; fresh leaves are commonly used in home cooking and tea.',price:120,imageUrl:''},
      {id:'mint',name:'Mint',bn:'পুদিনা',kind:'herb',tags:['bright','herb'],rows:[['Light','Morning sun'],['Water','Keep soil moist']],usefulness:'Keep fresh, aromatic leaves close at hand for drinks and cooking; a pot also helps contain its spreading roots.',price:100,imageUrl:''},
      {id:'terra-set',name:'Terracotta pot set',bn:'টেরাকোটা টব সেট',kind:'terra',tags:['care'],rows:[['Set','3 pots: 4, 5 and 6 inch'],['Good for','Succulents and herbs']],usefulness:'Three breathable pots in handy sizes for grouping small succulents, herbs, or cuttings.',price:350,imageUrl:''},
      {id:'ceramic-pot',name:'Ceramic pot',bn:'সিরামিক টব',kind:'ceramic',tags:['care'],rows:[['Size','6 inch, glazed'],['Comes with','Drainage hole and saucer']],usefulness:'A neat indoor planter with a drainage hole and saucer to help protect the surface beneath it.',price:450,imageUrl:''},
      {id:'terrarium',name:'Glass terrarium',bn:'টেরারিয়াম',kind:'terrarium',tags:['care'],rows:[['Size','20 cm glass jar'],['Includes','Pebbles, soil and a mini plant']],usefulness:'A ready-made mini garden display that brings a small patch of greenery to a desk or side table.',price:1100,imageUrl:''},
      {id:'soil',name:'Potting mix',bn:'পটিং মিক্স',kind:'soil',tags:['care'],rows:[['Pack','2 kg'],['Mix','Soil, cocopeat and compost']],usefulness:'A convenient growing medium for potting and refreshing indoor plants, with cocopeat and compost in the mix.',price:150,imageUrl:''},
      {id:'fertilizer',name:'Plant fertilizer',bn:'গাছের সার',kind:'fert',tags:['care'],rows:[['Pack','500 ml liquid'],['Use','Once every 2 weeks']],usefulness:'A liquid feed for routine plant care during active growth; follow the product label and avoid overfeeding.',price:220,imageUrl:''},
      {id:'can',name:'Watering can',bn:'ওয়াটারিং ক্যান',kind:'can',tags:['care'],rows:[['Size','1.5 litre'],['Spout','Long, narrow neck']],usefulness:'The narrow spout helps direct water into pots neatly, especially around crowded leaves and small containers.',price:380,imageUrl:''}
    ],
    blog: { eyebrow:'The Leafora journal', title:'Growing, together.', intro:'Plant care notes, growing tips and stories from Leafora will live here.', emptyMessage:'Our first post is on its way. Check back soon.', posts:[] }
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function merge(base, incoming) {
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return incoming === undefined ? clone(base) : incoming;
    var result = Object.assign({}, base || {});
    Object.keys(incoming).forEach(function (key) {
      if (key === 'products' && Array.isArray(incoming[key]) && Array.isArray(result[key])) {
        result[key] = incoming[key].map(function (product) {
          var saved = result[key].filter(function (item) { return item && item.id === product.id; })[0] || {};
          return merge(saved, product);
        });
      } else {
        result[key] = incoming[key] && typeof incoming[key] === 'object' && !Array.isArray(incoming[key])
          ? merge(result[key], incoming[key]) : incoming[key];
      }
    });
    return result;
  }

  var config = window.LEAFORA_SUPABASE_CONFIG || {};
  var configured = /^https:\/\/.+\.supabase\.co$/.test(config.url || '') && /^(sb_publishable_|eyJ)/.test(config.publishableKey || '');
  var client = configured && window.supabase && window.supabase.createClient ? window.supabase.createClient(config.url, config.publishableKey) : null;
  window.LEAFORA_DEFAULT_CONTENT = defaults;
  window.LEAFORA = {
    client: client, configured: !!client, defaults: defaults, clone: clone,
    loadContent: async function () {
      if (!client) return clone(defaults);
      var result = await client.from('site_content').select('data').eq('id','main').maybeSingle();
      if (result.error) throw result.error;
      return result.data ? merge(clone(defaults), result.data.data) : clone(defaults);
    },
    saveContent: async function (data, userId) {
      if (!client) throw new Error('Supabase is not configured yet.');
      var result = await client.from('site_content').upsert({id:'main',data:data,updated_at:new Date().toISOString(),updated_by:userId},{onConflict:'id'});
      if (result.error) throw result.error;
    },
    isAdmin: async function () {
      if (!client) return false;
      var result = await client.rpc('is_site_admin');
      if (result.error) throw result.error;
      return result.data === true;
    }
  };
})();
