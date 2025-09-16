const StatCard = ({ title, count, icon: Icon, bgColor, textColor, iconBg, borderColor, iconColor }) => (
    <div className={`${bgColor} p-3 rounded-2xl shadow-sm border ${borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center gap-x-7 justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{count}</p>
        </div>
        <div className={`${iconBg} p-3 rounded-xl shadow-md animate-bounce`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  export default StatCard