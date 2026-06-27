import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/dateHelpers';
import { formatPurpose, getStatusColor } from '../../utils/formatters';
import { EyeIcon } from '@heroicons/react/24/outline';

const RecentVisitsTable = ({ visits, showDealer = true }) => {
  if (!visits || visits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No visits found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            {showDealer && <th className="px-4 py-3">Dealer</th>}
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Purpose</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {visits.map((visit) => (
            <tr key={visit.id} className="hover:bg-gray-50">
              {showDealer && (
                <td className="px-4 py-3 font-medium text-gray-900">
                  {visit.dealer?.name || 'Unknown'}
                </td>
              )}
              <td className="px-4 py-3 text-gray-600">
                {formatDate(visit.visitDate)}
              </td>
              <td className="px-4 py-3">
                <span className="text-gray-700">{formatPurpose(visit.purpose)}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(visit.status)}`}>
                  {formatStatus(visit.status)}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/dealers/${visit.dealerId}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentVisitsTable;