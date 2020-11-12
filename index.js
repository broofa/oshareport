function $(...args) {
  return document.querySelectorAll(...args);
}

// LocalStorage key for saving user contact info
const STORE_KEY = 'oshaFields';

// Fields containing user contact info
const STORE_FIELDS = [
  '#contct_frst_nm',
  '#contct_lst_nm',
  '#contct_email',
  '#contct_phone',
  '#remember_info',
];

// Fields to include in sharable links to the form
const SHARE_FIELDS = ['#emplyr_bus_nm', '#emplyr_bus_type', '#emplyr_street_addr', '#emplyr_city', '#emplyr_county', '#emplyr_zip', '#emplyr_phone'];

// The field that indicates whether or not user dicussed the issue with anyone gets derived from
// other fields
function updateDiscussed() {
  const DISCUSS_TYPES = [
    '#haz_rpt_cowrkr',
    '#haz_rpt_suprvs',
    '#haz_rpt_safety_comm',
  ];

  const didDiscuss = DISCUSS_TYPES.reduce((v, id) => v || $(id)[0].checked, false);
  $('#haz_rpt_none')[0].value = didDiscuss ? '' : 'Y';
}

function storeFields() {
  const vals = {};

  if (!$('#remember_info')[0].checked) {
    localStorage.clear();
    return;
  };

  for (const id of STORE_FIELDS) {
    const el = $(id)[0];
    vals[id] = el.type == 'checkbox' ? el.checked : el.value;
  }

  localStorage.setItem(STORE_KEY, JSON.stringify(vals));
}

function restoreFields() {
  let fields;
  try {
    fields = JSON.parse(window.localStorage.getItem(STORE_KEY));
  } catch (err) {
    // non-existent or invalid... ignore.
  }
  if (!fields) return;

  for (const [id, value] of Object.entries(fields)) {
    const el = $(id)[0];
    if (typeof(value) == 'boolean') {
      el.checked = value;
    } else {
      el.value = value;
    }
  }
}

function formToParams() {
  const params = new URLSearchParams();
  for (const id of SHARE_FIELDS) {
    const val = $(id)[0].value;
    if (val) params.set(id.replace('#emplyr_', ''), val);
  }

  const url = new URL(location);
  url.search = params;
  history.replaceState(null, '', url);
}

function paramsToForm() {
  const params = new URLSearchParams(location.search);
  for (const [part, value] of params) {
    const el = $(`#emplyr_${part}`)[0];
    if (!el) continue;
    el.value = value;
  }
}
function onSubmit(e) {
  const descEl = $('#haz_desc')[0];

  updateDiscussed();

  // Copy email to verified-email because having to enter your email address twice is stupid
  $('#contct_verify_email')[0].value = $('#contct_email')[0].value;

  // Insert description footer
  const FOOTER = `--- FOOTER ---\n This complaint was created at https://broofa.github.io/oshareport`;
  const desc = descEl.value.replace(/--- FOOTER ---/mg, '').trim();
  descEl.value = `${desc}\n\n${FOOTER}`;
}

function onLoad() {
  // Propagate input names to ids
  for (const el of [...$('input'), ...$('textarea')]) {
    if (!el.name) continue;
    el.id = el.name;
  }

  // Fill in fields from query params
  paramsToForm();

  // Submit handler
  $('form')[0].addEventListener('submit', onSubmit);

  // Handle changes in storable fields
  for (const id of STORE_FIELDS) {
    $(id)[0].addEventListener('change', storeFields);
  }

  // Handle changes in sharable fields
  for (const id of SHARE_FIELDS) {
    $(id)[0].addEventListener('change', formToParams);
  }

  // Remove description footer if present
  setTimeout(function() {
    const descEl = $('#haz_desc')[0];
    descEl.value = descEl.value.replace(/--- FOOTER ---\n.*/mg, '').trim();
  }, 500);

  // Restore user info (if present)
  restoreFields();
}

window.addEventListener('DOMContentLoaded', onLoad);

