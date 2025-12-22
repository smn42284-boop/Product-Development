import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faUsers, 
  faEnvelope, 
  faCalendarAlt,
  faCalendar,
  faChartBar, 
  faEye, 
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faTrash,
  faDownload,
  faFilter,
  faGlobe,
  faUserTie,
  faBuilding,
  faPhone,
  faClock,
  faChartLine,
  faExternalLinkAlt,
  faCopy,
  faSearch,
  faTimes,
  faMapMarkerAlt,
  faCalendarDays,
  faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Add these to your existing state declarations:
const [isLocked, setIsLocked] = useState(false);
const [lockTime, setLockTime] = useState(null);
const [remainingAttempts, setRemainingAttempts] = useState(5);
const [loginAttempts, setLoginAttempts] = useState([]); // Track timestamps of attempts
 
  
  const [analytics, setAnalytics] = useState({
    totalQueries: 0,
    todayQueries: 0,
    weekQueries: 0,
    monthQueries: 0,
    newQueries: 0,
    contactedQueries: 0,
    resolvedQueries: 0,
    countries: 0,
    jobTitles: 0,
    companies: 0
  });

  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);

  // Check if user is already logged in (using sessionStorage)
  useEffect(() => {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
  const savedContacts = localStorage.getItem('adminContacts');
  
  // Check if account is locked
  const lockUntil = localStorage.getItem('adminLockUntil');
  const attempts = localStorage.getItem('loginAttempts') || 5;
  const attemptTimestamps = JSON.parse(localStorage.getItem('loginAttemptTimestamps') || '[]');
  
  if (lockUntil && new Date(lockUntil) > new Date()) {
    setIsLocked(true);
    setLockTime(new Date(lockUntil));
  } else if (lockUntil && new Date(lockUntil) <= new Date()) {
    localStorage.removeItem('adminLockUntil');
    localStorage.setItem('loginAttempts', 5);
    localStorage.removeItem('loginAttemptTimestamps');
    setRemainingAttempts(5);
    setLoginAttempts([]);
  }
  
  setRemainingAttempts(parseInt(attempts));
  setLoginAttempts(attemptTimestamps);
  
  if (loggedIn === 'true') {
    setIsAuthenticated(true);
  }
    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts);
        
        const enrichedContacts = parsedContacts.map(contact => ({
          ...contact,
          job_title: contact.job_title || 'Not specified',
          country: contact.country || 'Not specified',
          company: contact.company || 'Not specified'
        }));
        
        setContacts(enrichedContacts);
        setFilteredContacts(enrichedContacts);
        
        const analyticsData = calculateAnalytics(enrichedContacts);
        setAnalytics(analyticsData);
        
      } catch (error) {
        console.log('Error loading saved contacts:', error);
      }
    }
  }, []);

  // Calculate date ranges
  const getDateRanges = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const weekStart = new Date(weekAgo.getFullYear(), weekAgo.getMonth(), weekAgo.getDate());
    
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);
    const monthStart = new Date(monthAgo.getFullYear(), monthAgo.getMonth(), monthAgo.getDate());
    
    return { todayStart, weekStart, monthStart };
  };

  const calculateAnalytics = (contactsData) => {
    const { todayStart, weekStart, monthStart } = getDateRanges();
    
    const todayQueries = contactsData.filter(contact => 
      new Date(contact.submitted_at) >= todayStart
    ).length;
    
    const weekQueries = contactsData.filter(contact => 
      new Date(contact.submitted_at) >= weekStart
    ).length;
    
    const monthQueries = contactsData.filter(contact => 
      new Date(contact.submitted_at) >= monthStart
    ).length;
    
    const newQueries = contactsData.filter(contact => contact.status === 'new').length;
    const contactedQueries = contactsData.filter(contact => contact.status === 'contacted').length;
    const resolvedQueries = contactsData.filter(contact => contact.status === 'resolved').length;
    
    const countries = new Set(contactsData.map(c => c.country)).size;
    const jobTitles = new Set(contactsData.map(c => c.job_title)).size;
    const companies = new Set(contactsData.map(c => c.company)).size;
    
    return {
      totalQueries: contactsData.length,
      todayQueries,
      weekQueries,
      monthQueries,
      newQueries,
      contactedQueries,
      resolvedQueries,
      countries,
      jobTitles,
      companies
    };
  };

  const filterContactsByTime = (contactsData, filter) => {
    const { todayStart, weekStart, monthStart } = getDateRanges();
    
    switch(filter) {
      case 'today':
        return contactsData.filter(contact => 
          new Date(contact.submitted_at) >= todayStart
        );
      case 'week':
        return contactsData.filter(contact => 
          new Date(contact.submitted_at) >= weekStart
        );
      case 'month':
        return contactsData.filter(contact => 
          new Date(contact.submitted_at) >= monthStart
        );
      default:
        return contactsData;
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(filterContactsByTime(contacts, timeFilter));
      return;
    }
    
    const searchLower = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.company.toLowerCase().includes(searchLower) ||
      contact.job_title.toLowerCase().includes(searchLower) ||
      contact.country.toLowerCase().includes(searchLower) ||
      contact.requirements.toLowerCase().includes(searchLower)
    );
    
    setFilteredContacts(filtered);
  }, [searchQuery, contacts, timeFilter]);
  // Add these functions before handleLogin:

const recordFailedAttempt = () => {
  const now = new Date();
  const newAttempts = [...loginAttempts, now];
  setLoginAttempts(newAttempts);
  localStorage.setItem('loginAttemptTimestamps', JSON.stringify(newAttempts));

  const fifteenMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
  const recentAttempts = newAttempts.filter(time => new Date(time) > fifteenMinutesAgo);
  
  if (recentAttempts.length >= 5) {
    // Lock account for 15 minutes
    const lockUntil = new Date(now.getTime() + 2 * 60 * 1000);
    localStorage.setItem('adminLockUntil', lockUntil.toISOString());
    setIsLocked(true);
    setLockTime(lockUntil);
    return true; // Account is now locked
  }
  
  // Update remaining attempts
  const remaining = 5 - recentAttempts.length;
  setRemainingAttempts(remaining);
  localStorage.setItem('loginAttempts', remaining);
  return false; // Account not locked
};

const resetAttempts = () => {
  localStorage.removeItem('loginAttempts');
  localStorage.removeItem('adminLockUntil');
  localStorage.removeItem('loginAttemptTimestamps');
  setRemainingAttempts(5);
  setLoginAttempts([]);
  setIsLocked(false);
  setLockTime(null);
};

const getRemainingLockTime = () => {
  if (!lockTime) return 0;
  const now = new Date();
  return Math.max(0, Math.ceil((lockTime - now) / 1000));
};

  const handleLogin = (e) => {
  e.preventDefault();
  
  // Check if account is locked
  if (isLocked && lockTime && new Date() < lockTime) {
    const remainingSeconds = getRemainingLockTime();
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    setLoginError(`Account locked! Too many failed attempts. Try again in ${minutes}:${seconds.toString().padStart(2, '0')}`);
    return;
  }
  
  // If lock expired, reset
  if (isLocked && lockTime && new Date() >= lockTime) {
    resetAttempts();
  }
  
  if (!loginData.username.trim() || !loginData.password.trim()) {
    setLoginError('Please enter both username and password');
    return;
  }
  
  if (loginData.username === 'admin' && loginData.password === 'admin123') {
    // Successful login - reset attempts
    resetAttempts();
    setIsAuthenticated(true);
    setLoginError('');
    sessionStorage.setItem('adminLoggedIn', 'true');
    setLoginData({ username: '', password: '' });
  } else {
    // Failed login - record attempt
    const isNowLocked = recordFailedAttempt();
    
    if (isNowLocked) {
      const remainingSeconds = getRemainingLockTime();
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      setLoginError(`Account locked! Too many failed attempts. Try again in ${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setLoginError(`Invalid credentials. ${remainingAttempts - 1} attempt${remainingAttempts - 1 > 1 ? 's' : ''} remaining.`);
    }
  }
};
const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setContacts([]);
  };

  const updateContactStatus = (id, newStatus) => {
    const updatedContacts = contacts.map(contact => 
      contact.id === id ? { ...contact, status: newStatus } : contact
    );
    
    setContacts(updatedContacts);
    setFilteredContacts(filterContactsByTime(updatedContacts, timeFilter));
    localStorage.setItem('adminContacts', JSON.stringify(updatedContacts));
    
    const analyticsData = calculateAnalytics(updatedContacts);
    setAnalytics(analyticsData);
  };

  

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    const filtered = filterContactsByTime(contacts, filter);
    setFilteredContacts(filtered);
  };


  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getTimeIcon = (period) => {
    switch(period) {
      case 'today': return faCalendarAlt;
      case 'week': return faCalendarAlt;
      case 'month': return faCalendar;
      default: return faChartLine;
    }
  };

  const getTimeLabel = (period) => {
    switch(period) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const formatRequirements = (text) => {
    if (!text) return 'No requirements provided.';
    
    return text
      .split('. ')
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => sentence.endsWith('.') ? sentence : sentence + '.')
      .join('\n\n');
  };

  if (!isAuthenticated) {
  const remainingSeconds = getRemainingLockTime();
  const lockMinutes = Math.floor(remainingSeconds / 60);
  const lockSeconds = remainingSeconds % 60;
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-royal-blue text-white rounded-lg mb-4">
              <FontAwesomeIcon icon={faChartBar} className="text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h1>
 
            {/* Security Status Badge */}
           
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="mt-4">
              {isLocked ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                  <div className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                    Account Locked - Try again in {lockMinutes}:{lockSeconds.toString().padStart(2, '0')}
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-sm">
                  <div className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                    Security Active - {remainingAttempts} attempt{remainingAttempts > 1 ? 's' : ''} remaining
                  </div>
                </div>
              )}
            </div>
            )}

            <div className="space-y-2">
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className={`w-full px-4 py-2 border ${isLocked ? 'border-gray-300 bg-gray-100' : 'border-gray-300'} rounded focus:ring-2 focus:ring-royal-blue focus:border-blue-500`}
                placeholder="Enter username"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className={`w-full px-4 py-2 border ${isLocked ? 'border-gray-300 bg-gray-100' : 'border-gray-300'} rounded focus:ring-2 focus:ring-royal-blue focus:border-blue-500 pr-10`}
                  placeholder="Enter password"
                  disabled={isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  disabled={isLocked}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLocked}
              className={`w-full py-2 rounded font-medium transition ${isLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-royal-blue text-white hover:bg-blue-700'}`}
            >
              {isLocked ? 'Account Locked' : 'Sign In'}
            </button>
          </form>

         
        </div>
      </div>
    </div>
  );
}

  const RequirementsModal = ({ contact, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Project Requirements</h2>
              <p className="text-gray-600 text-sm">From {contact.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-royal-blue text-white rounded flex items-center justify-center font-medium">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{contact.name}</div>
                  <div className="text-gray-600 text-sm">{contact.job_title}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="text-gray-500">Email</div>
                  <div className="font-medium">{contact.email}</div>
                </div>
                {contact.phone && (
                  <div className="text-sm">
                    <div className="text-gray-500">Phone</div>
                    <div className="font-medium">{contact.phone}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-gray-500 text-sm">Company</div>
                <div className="font-medium">{contact.company || 'Not specified'}</div>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-gray-500 text-sm">Country</div>
                  <div className="font-medium flex items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
                    {contact.country || 'Not specified'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Submitted</div>
                  <div className="font-medium">{new Date(contact.submitted_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Project Requirements</h3>
              <button
                onClick={() => copyToClipboard(contact.requirements)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={faCopy} />
                <span>Copy</span>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <div className="whitespace-pre-line text-gray-700">
                {formatRequirements(contact.requirements)}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                window.open(`mailto:${contact.email}?subject=Regarding your inquiry`, '_blank');
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200"
            >
              Reply via Email
            </button>
            <select
              value={contact.status}
              onChange={(e) => updateContactStatus(contact.id, e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-royal-blue focus:border-blue-500"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedContact && (
        <RequirementsModal 
          contact={selectedContact} 
          onClose={() => setSelectedContact(null)} 
        />
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl font-semibold text-gray-900">Customer Inquiries</h1>
      
            </div>
            <div className="flex items-center space-x-3">
            
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200 flex items-center"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Queries</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.totalQueries)}</p>
              </div>
              <div className="bg-blue-50 text-royal-blue p-2 rounded">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.todayQueries)}</p>
              </div>
              <div className="bg-blue-50 text-royal-blue p-2 rounded">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.weekQueries)}</p>
              </div>
              <div className="bg-blue-50 text-royal-blue p-2 rounded">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.monthQueries)}</p>
              </div>
              <div className="bg-blue-50 text-royal-blue p-2 rounded">
                <FontAwesomeIcon icon={faCalendar} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-royal-blue focus:border-blue-500"
                  placeholder="Search inquiries..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm">Filter by:</span>
              {['today', 'week', 'month', 'all'].map((period) => (
                <button
                  key={period}
                  onClick={() => handleTimeFilterChange(period)}
                  className={`px-3 py-1 rounded text-sm ${
                    timeFilter === period
                      ? 'bg-royal-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getTimeLabel(period)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700">New</span>
              <span className="font-medium">{formatNumber(analytics.newQueries)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full"
                style={{ 
                  width: `${analytics.totalQueries > 0 ? (analytics.newQueries / analytics.totalQueries) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700">Contacted</span>
              <span className="font-medium">{formatNumber(analytics.contactedQueries)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                class Name="bg-blue-500 h-2 rounded-full"
                style={{ 
                  width: `${analytics.totalQueries > 0 ? (analytics.contactedQueries / analytics.totalQueries) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700">Resolved</span>
              <span className="font-medium">{formatNumber(analytics.resolvedQueries)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ 
                  width: `${analytics.totalQueries > 0 ? (analytics.resolvedQueries / analytics.totalQueries) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Customer Inquiries</h2>
            <p className="text-gray-600 text-sm">
              Showing {filteredContacts.length} inquiries
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          
          {filteredContacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        <div className="text-gray-500 text-sm">{contact.company}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{contact.job_title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{contact.email}</div>
                        {contact.phone && (
                          <div className="text-gray-500 text-sm">{contact.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          contact.status === 'new' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : contact.status === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="text-royal-blue hover:text-blue-700 text-sm flex items-center"
                          >
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
                            View
                          </button>
                          <select
                            value={contact.status}
                            onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-royal-blue focus:border-blue-500"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <FontAwesomeIcon icon={faSearch} size="2x" />
              </div>
              <h3 className="text-gray-900 font-medium mb-2">No inquiries found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try a different search term'
                  : 'No customer inquiries yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;