const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = 'index.html';

document.getElementById('welcomeMessage').textContent = `Hello, ${user.username}!`;

let txns = JSON.parse(localStorage.getItem('txns') || '[]');
let editingIndex = -1;

function save() {
  localStorage.setItem('txns', JSON.stringify(txns));
  render();
}

function renderStatus(status) {
  if (status === 'successful') {
    return `<span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800 items-center">
      <i class="fas fa-check-circle text-xs"></i> Successful
    </span>`;
  } else {
    return `<span class="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 items-center ">
      <i class="fas fa-clock text-yellow-600 text-xs"></i> Pending
    </span>`;
  }
}

function updateStats() {
  const total = txns.length;
  const pending = txns.filter(t => t.status === 'pending').length;
  const success = txns.filter(t => t.status === 'successful').length;
  const clients = new Set(txns.map(t => t.client)).size;
  const totalMoney = txns.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  document.getElementById('total').textContent = total;
  document.getElementById('pending').textContent = pending;
  document.getElementById('success').textContent = success;
  document.getElementById('clients').textContent = clients;
  document.getElementById('totalMoney').textContent = `Rp ${totalMoney.toLocaleString()}`;
  document.getElementById('count').textContent = `${total} ${total === 1 ? 'item' : 'items'}`;
}

function render() {
  const tbody = document.getElementById('list');
  const empty = document.getElementById('empty');

  if (txns.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    tbody.innerHTML = txns.map((t, i) => `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3">${t.client}</td>
        <td class="px-4 py-3">Rp ${parseFloat(t.amount).toLocaleString()}</td>
        <td class="px-4 py-3">${renderStatus(t.status)}</td>
        <td class="px-4 py-3">${t.date}</td>
        <td class="px-4 py-3 flex items-center space-x-2 mx-3"> <!-- ✅ Perbaikan utama -->
          <button onclick="edit(${i})" class="text-white bg-blue-700 px-3 py-1.5 rounded ">
            <i class="fas fa-edit mr-1"></i> Edit
          </button>
          <button onclick="del(${i})" class="bg-red-600 text-white px-3 py-1.5 rounded">
            <i class="fas fa-trash mr-1"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  }
  updateStats();
}

document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const client = document.getElementById('client').value.trim();
  const amount = document.getElementById('amount').value;
  const status = document.getElementById('status').value;
  const date = document.getElementById('date').value;

  if (!client || !amount || !date) {
    Swal.fire('Oops!', 'Please fill all fields.', 'warning');
    return;
  }

  if (editingIndex >= 0) {
    txns[editingIndex] = { client, amount, status, date };
    editingIndex = -1;
    document.getElementById('addBtn').textContent = 'Add';
  } else {
    txns.push({ client, amount, status, date });
  }
  save();
  resetForm();
});

window.edit = (index) => {
  const t = txns[index];
  document.getElementById('client').value = t.client;
  document.getElementById('amount').value = t.amount;
  document.getElementById('status').value = t.status;
  document.getElementById('date').value = t.date;
  editingIndex = index;
  document.getElementById('addBtn').textContent = 'Update';
};

window.del = (index) => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      txns.splice(index, 1);
      save();
      Swal.fire('Deleted!', 'Your transaction has been deleted.', 'success');
    }
  });
};

function resetForm() {
  document.getElementById('form').reset();
  editingIndex = -1;
  document.getElementById('addBtn').textContent = 'Add';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
}

window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
});

function logout() {
  Swal.fire({
    title: 'Logout',
    text: "Are you sure you want to logout?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, logout!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      window.location.href = 'index.html';
    }
  });
}

render();