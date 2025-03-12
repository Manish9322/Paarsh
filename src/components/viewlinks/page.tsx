export default function ViewLinks() {
    const meetings = [
      { id: 1, title: "Team Standup", time: "10:00 AM - 10:30 AM", link: "https://meet.google.com/abc-defg-hij" },
      { id: 2, title: "Project Review", time: "2:00 PM - 3:00 PM", link: "https://meet.google.com/xyz-lmnop-qrst" },
      { id: 3, title: "Client Meeting", time: "4:00 PM - 5:00 PM", link: "https://meet.google.com/uvw-xyz-1234" },
    ];
  
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Upcoming Meetings</h2>
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="p-4 bg-gray-200 rounded-lg flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                  <p className="text-gray-600">{meeting.time}</p>
                </div>
                <a href={meeting.link} target="_blank" rel="noopener noreferrer"
                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                  Join Meeting
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }