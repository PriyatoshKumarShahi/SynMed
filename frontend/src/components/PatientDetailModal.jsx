import React from 'react';
import { X, Calendar, Phone, Mail, User, Heart, Pill, AlertTriangle } from 'lucide-react';

export default function PatientDetailModal({ patient, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateFromString = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <img
              src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name}&background=3B82F6&color=fff`}
              alt={patient.name}
              className="h-16 w-16 rounded-full object-cover mr-4"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-600">{patient.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-900">Personal Info</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Gender:</span> {patient.gender || 'N/A'}</p>
                <p><span className="font-medium">DOB:</span> {formatDateFromString(patient.dob)}</p>
                <p><span className="font-medium">Phone:</span> {patient.phone || 'N/A'}</p>
                <p><span className="font-medium">Address:</span> {patient.address || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Heart className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-900">Medical Info</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Blood Group:</span> {patient.bloodGroup || 'N/A'}</p>
                <p><span className="font-medium">Height:</span> {patient.height || 'N/A'}</p>
                <p><span className="font-medium">Weight:</span> {patient.weight || 'N/A'}</p>
                <p><span className="font-medium">Emergency:</span> {patient.emergencyContact || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-900">Health Conditions</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Allergies:</span> {patient.allergies || 'None'}</p>
                <p><span className="font-medium">Chronic Diseases:</span> {patient.chronicDiseases || 'None'}</p>
                <p><span className="font-medium">Current Medicines:</span> {patient.medicines || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Pill className="h-6 w-6 text-blue-600 mr-2" />
                Prescriptions ({patient.prescriptions?.length || 0})
              </h3>
              
              {patient.prescriptions && patient.prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {patient.prescriptions.map((prescription) => (
                    <div key={prescription._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {prescription.doctorName || 'Doctor Name Not Available'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {prescription.hospitalName || 'Hospital Not Specified'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Date: {formatDate(prescription.prescriptionDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center mb-3">
                        <img
                          src={prescription.imageUrl}
                          alt="Prescription"
                          className="max-w-full h-48 object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(prescription.imageUrl, '_blank')}
                        />
                      </div>
                      
                      {prescription.notes && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Notes:</span> {prescription.notes}
                          </p>
                        </div>
                      )}
                      
                      {prescription.medicines && prescription.medicines.length > 0 && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <h5 className="font-medium text-gray-900 mb-2">Prescribed Medicines:</h5>
                          <div className="space-y-1">
                            {prescription.medicines.map((medicine, index) => (
                              <div key={index} className="text-sm text-gray-700">
                                <span className="font-medium">{medicine.name}</span>
                                {medicine.dosage && <span> - {medicine.dosage}</span>}
                                {medicine.frequency && <span> ({medicine.frequency})</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>No prescriptions available</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-6 w-6 text-purple-600 mr-2" />
                Test Results ({patient.tests?.length || 0})
              </h3>
              
              {patient.tests && patient.tests.length > 0 ? (
                <div className="space-y-4">
                  {patient.tests.map((test) => (
                    <div key={test._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">Test Result</h4>
                          <p className="text-sm text-gray-600">
                            Uploaded: {formatDate(test.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <img
                          src={test.url}
                          alt="Test Result"
                          className="max-w-full h-48 object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(test.url, '_blank')}
                        />
                      </div>
                      
                      {test.filename && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {test.filename}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>No test results available</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Patient registered on:</span> {formatDate(patient.createdAt)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Total Records:</span> {(patient.prescriptions?.length || 0) + (patient.tests?.length || 0)} items
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}