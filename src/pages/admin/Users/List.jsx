// src/pages/admin/Users/List.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowsUpDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Mock user data since we don't have a real users API hook
const MOCK_USERS = [
  { 
    id: 1, 
    username: 'johndoe', 
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1 555-123-4567',
    role: 'ROLE_USER',
    createdAt: '2023-01-15T10:30:00Z'
  },
  { 
    id: 2, 
    username: 'janedoe', 
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNumber: '+1 555-987-6543',
    role: 'ROLE_USER',
    createdAt: '2023-02-20T14:45:00Z'
  },
  { 
    id: 3, 
    username: 'adminuser', 
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '+1 555-789-0123',
    role: 'ROLE_ADMIN',
    createdAt: '2023-01-01T08:00:00Z'
  },
  { 
    id: 4, 
    username: 'manager', 
    email: 'manager@example.com',
    firstName: 'Theatre',
    lastName: 'Manager',
    phoneNumber: '+1 555-456-7890',
    role: 'ROLE_MANAGER',
    createdAt: '2023-01-10T09:15:00Z'
  },
  { 
    id: 5, 
    username: 'bobsmith', 
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Smith',
    phoneNumber: '+1 555-234-5678',
    role: 'ROLE_USER',
    createdAt: '2023-03-05T11:20:00Z'
  }
];

const UserList = () => {
  const { showSuccess, showError } = useToast();
  
  // State for search, filters, and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [sortBy, setSortBy] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState(MOCK_USERS);
  
  // Mock delete function
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUsers(users.filter(user => user.id !== id));
        setIsLoading(false);
        showSuccess('User deleted successfully');
      }, 1000);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle role filter change
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      // Search filter
      const searchMatch = searchQuery === '' || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Role filter
      const roleMatch = selectedRole === '' || user.role === selectedRole;
      
      return searchMatch && roleMatch;
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0;
      
      switch (sortBy) {
        case 'username':
          comparison = a.username.localeCompare(b.username);
          break;
        case 'fullName':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = a.username.localeCompare(b.username);
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Users</h1>
        <Link to="/admin/users/create">
          <Button 
            variant="primary"
            icon={<PlusIcon className="h-5 w-5 mr-2" />}
          >
            Add User
          </Button>
        </Link>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {/* Role filter */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedRole}
                  onChange={handleRoleChange}
                >
                  <option value="">All Roles</option>
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_MANAGER">Manager</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>
            </div>
            
            {/* Reset filters */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRole('');
                }}
                disabled={!searchQuery && !selectedRole}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Table headers with sort functionality */}
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('username')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Username</span>
                      {sortBy === 'username' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('fullName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {sortBy === 'fullName' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      {sortBy === 'email' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Role</span>
                      {sortBy === 'role' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                          <UserIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{`${user.firstName} ${user.lastName}`}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <PhoneIcon className="h-3 w-3 mr-1" />
                        {user.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ROLE_ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : user.role === 'ROLE_MANAGER'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/admin/users/${user.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link to={`/admin/users/${user.id}/edit`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={<PencilSquareIcon className="h-4 w-4" />}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="danger" 
                          size="sm"
                          icon={<TrashIcon className="h-4 w-4" />}
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === 'ROLE_ADMIN'} // Prevent deleting admins
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ExclamationCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedRole
                ? 'No users match your filters. Try adjusting your search criteria.'
                : 'There are no users in the system yet. Add your first user to get started.'
              }
            </p>
            <Link to="/admin/users/create">
              <Button 
                variant="primary"
                icon={<PlusIcon className="h-5 w-5 mr-2" />}
              >
                Add User
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;