import membershipImg from "../assets/membership-img.jpg";

const Memberships = () => {
  return (
    <div className="bg-black flex items-center justify-center px-4 py-8">
      {/* Main Card */}
      <div className="relative bg-[#111116] border border-gray-700 rounded-2xl w-full max-w-4xl pt-6 md:pt-24 px-6 md:px-12 shadow-2xl mt-6 md:mt-28 mb-8">
        
        {/* Top Image Desktop */}
        <div className="hidden md:block absolute -top-32 left-1/2 transform -translate-x-1/2">
          <img
            src={membershipImg}
            alt="Membership"
            className="w-80 rounded-2xl shadow-xl object-cover"
          />
        </div>

        {/* Mobile image */}
        <div className="flex justify-center mb-6 md:hidden">
          <img
            src={membershipImg}
            alt="Membership"
            className="w-full max-w-[240px] sm:max-w-[320px] rounded-2xl shadow-xl object-cover"
          />
        </div>

        {/* Join Button */}
        <button className="w-full bg-[#e5007d] transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] py-3 rounded-lg text-white text-lg sm:text-xl font-bold mb-8 sm:mb-12 shadow-lg">
          Join now for $15
        </button>

        {/* Content Area */}
        <div className="text-white space-y-8 sm:space-y-12 pb-8">
          
          <section>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-[#e5007d]">
              Join the FOMO Cinemas Membership Program!
            </h1>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              Become a FOMO Cinemas Membership Member and enjoy exclusive perks
              all year round! Get discounts, invites to special screenings,
              exclusive updates, giveaways, and much more!
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Membership Options:</h2>
            <ul className="list-disc pl-5 sm:pl-8 text-base sm:text-lg text-gray-300 space-y-2">
              <li>Standard Membership</li>
              <li>Premium Membership</li>
              <li>Student Membership</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">How to Purchase:</h2>
            <ul className="list-disc pl-5 sm:pl-8 text-base sm:text-lg text-gray-300 space-y-3">
              <li>
                Memberships are valid for 12 months and can be bought online or
                at the FOMO Cinemas Candy Bar.
              </li>
              <li>
                If you buy online, you can pick up your membership card at your
                next visit.
              </li>
              <li>
                If purchased in-person, make sure to activate your card to
                access your online member portal.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Benefits of the FOMO Cinemas Membership Program:
            </h2>
            <ul className="list-disc pl-5 sm:pl-8 text-base sm:text-lg text-gray-300 space-y-3">
              <li>
                $21 tickets ($24 rear recliners) for you + one guest to all
                standard sessions (excluding Cheap Tuesdays).
              </li>
              <li>
                $17 concession tickets ($20 rear recliners) for you + one
                concessional guest to all standard sessions (excluding Cheap
                Tuesdays).
              </li>
              <li>
                Invitations to exclusive member screenings, advance screenings,
                events, and giveaways.
              </li>
              <li>Weekly film updates, plus early access to tickets.</li>
              <li>Opportunities for free screenings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">*T&Cs</h2>
            <ul className="list-disc pl-5 sm:pl-8 text-base sm:text-lg text-gray-300 space-y-3">
              <li>Membership is valid for 12 months and non-transferable.</li>
              <li>
                An active membership card (physical or digital) is required to
                access benefits.
              </li>
              <li>
                To collect your card, provide your ID and proof of purchase
                (email receipt) at the FOMO bar.
              </li>
              <li>
                You must subscribe to our membership emails to receive special
                invites and giveaways.
              </li>
              <li>
                By joining, you agree to receive FOMO Cinema emails but can
                unsubscribe at any time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#e5007d]">*FAQs</h2>
            
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  How do I purchase a Fomo Loyalty membership?
                </h3>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  Memberships are only $15, and are valid for 12 months. They
                  can be purchased online using the Membership tab, or at the
                  Fomo Box Office. If you purchase online, make sure to pick up
                  your physical membership card upon your next visit to Fomo to
                  finalise your account set-up.
                </p>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  I lost my card OR My card has been stolen OR I need to change my
                  card details
                </h3>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  If your card has been lost or stolen, a new card can be
                  arranged by visiting the Fomo Box Office. Please note a $5
                  card replacement fee applies. If you need to update your
                  details, please email manager@fomocinemas.com.au. Please
                  include your full name and card number in the body of your
                  email.
                </p>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  What are the benefits of the FoMo Membership?
                </h3>
                <p className="text-base sm:text-lg text-gray-300 mb-3">
                  Benefits of FoMo Membership Include:
                </p>
                <ul className="list-disc pl-5 sm:pl-8 text-base sm:text-lg text-gray-400 space-y-2 mb-3">
                  <li>
                    Discounted tickets for members + one guest to standard
                    sessions of all regular season film.
                  </li>
                  <li>Discounted tickets for advance screenings.</li>
                  <li>
                    Discounted prices for film festivals and special event
                    screenings.
                  </li>
                  <li>
                    Exclusive member screening invitations and giveaways (email
                    address necessary).
                  </li>
                  <li>
                    Exclusive updates on new films and the chance to get tickets
                    first (email address necessary).
                  </li>
                </ul>
                <p className="text-base sm:text-lg text-gray-300">
                  To see details and sign up, visit our Membership page.
                </p>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  How do I purchase tickets online using my Loyalty card?
                </h3>
                <ol className="list-decimal pl-5 sm:pl-8 text-base sm:text-lg text-gray-300 space-y-2 mb-3">
                  <li>Make sure you are LOGGED IN.</li>
                  <li>Click on your chosen film session to begin the booking process.</li>
                  <li>Select your seats.</li>
                  <li>Select the yellow Membership seat type of your choice.</li>
                  <li>Proceed with the normal payment process.</li>
                  <li>
                    Receive your unique ticket and booking confirmation at your
                    chosen email address.
                  </li>
                  <li>Head to the cinema and bypass the box office!</li>
                </ol>
                <p className="text-sm sm:text-base text-gray-400 italic">
                  *Please present your Fomo Membership Card and your tickets for
                  checking at the cinema podium upon entry.
                </p>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  My membership is expired! How can I renew it?
                </h3>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-3">
                  Memberships can be renewed on the Fomo website and in-person at
                  the Fomo Candy Bar. To check your expiry date, or renew on the
                  website, go to your profile page.
                </p>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  To access the full benefits of your Fomo Membership, make sure
                  you have completed the sign-up process and have both a valid
                  online membership account AND a physical membership card.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Memberships;
