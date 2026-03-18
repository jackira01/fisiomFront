import { MdChatBubbleOutline } from 'react-icons/md';
import { RiQuestionLine } from 'react-icons/ri';
import { FiUser } from 'react-icons/fi';
import ResponseForm from './ResponseForm';
import ProfessionalInfo from './ProfessionalInfo';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const QuestionContent = ({ data, user }) => {
  const { _id, text, answer, isAnswered, creator, userId, createdDate } = data;
  const professional = answer?.professional || null;

  const creatorName = creator
    ? `${creator.firstname} ${creator.lastname}`
    : 'Usuario';
  const initial = creator ? creator.firstname[0].toUpperCase() : 'U';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
      <div className="w-full flex flex-col gap-3 min-w-0">
        {/* Header: avatar, nombre, fecha y badge de estado */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="size-9 shrink-0 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center select-none">
              {initial}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-secondary-700 flex items-center gap-1">
                <FiUser size={13} className="text-secondary-400" />
                {creatorName}
              </p>
              {createdDate && (
                <p className="text-xs text-secondary-400">{formatDate(createdDate)}</p>
              )}
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${isAnswered
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
              }`}
          >
            {isAnswered ? 'Respondida' : 'Sin respuesta'}
          </span>
        </div>

        {/* Texto de la pregunta */}
        <div className="break-words text-secondary-800">
          <RiQuestionLine size={18} className="text-primary-500 inline mr-1.5 shrink-0" />
          <span>{text}</span>
        </div>

        {/* Respuesta o formulario */}
        {isAnswered ? (
          <div className="break-words bg-primary-50 border-l-4 border-primary-400 pl-3 py-2 rounded-r-md text-secondary-700">
            <MdChatBubbleOutline size={17} className="text-primary-500 inline mr-1.5 shrink-0" />
            <span>{answer?.text}</span>
          </div>
        ) : (
          <ResponseForm questionId={_id} user={user} creatorId={userId} />
        )}
      </div>

      {isAnswered && professional && (
        <ProfessionalInfo professional={professional} />
      )}
    </div>
  );
};

export default QuestionContent;
