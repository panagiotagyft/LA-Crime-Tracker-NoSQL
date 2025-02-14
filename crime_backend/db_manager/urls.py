from django.urls import path

from .views.queries_views.query1_views import Query1View
from .views.queries_views.query2_views import Query2View
from .views.queries_views.query3_views import Query3View
from .views.queries_views.query4_views import Query4View
from .views.queries_views.query5_views import Query5View
from .views.queries_views.query6_views import Query6View
from .views.queries_views.query7_views import Query7View
from .views.queries_views.query8_views import Query8View
from .views.queries_views.query9_views import Query9View
from .views.queries_views.query10_views import Query10View


from .views.functions_views import DropdownOptionsView, GetCodeDescriptionView, GenerateDRNOView, GetRecordByDRNOView, SearchDRNumbersView, GetUserDetailsView
from .views.insert_views import InsertView
from .views.upvoting_views import UpvotingView
from .views.search_views import SearchView

urlpatterns = [
    # queries
    path('query1/', Query1View.as_view(), name='query1'),
    path('query2/', Query2View.as_view(), name='query2'),
    path('query3/', Query3View.as_view(), name='query3'),
    path('query4/', Query4View.as_view(), name='query4'),
    path('query5/', Query5View.as_view(), name='query5'),
    path('query6/', Query6View.as_view(), name='query6'),
    path('query7/', Query7View.as_view(), name='query7'),
    path('query8/', Query8View.as_view(), name='query8'),
    path('query9/', Query9View.as_view(), name='query9'),
    path('query10/', Query10View.as_view(), name='query10'),

    # functions
    path('dropdown-options/', DropdownOptionsView.as_view(), name='dropdown-options'),
    path('get-code-description/', GetCodeDescriptionView.as_view(), name='get-code-description'),
    path('generate-drno/', GenerateDRNOView.as_view(), name='generate-drno'),
    path('get-record/', GetRecordByDRNOView.as_view(), name='get-record'),
    path('search-dr-numbers/', SearchDRNumbersView.as_view(), name='search-dr-numbers'),
    path('get-user-details/', GetUserDetailsView.as_view(), name='get-user-details'),

    # updates & insert & search
    path('insert-record/', InsertView.as_view(), name='insert-record'),
    path('upvoting/', UpvotingView.as_view(), name='upvoting'),
    path('search/', SearchView.as_view(), name='search'),
]